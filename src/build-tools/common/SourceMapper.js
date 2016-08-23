var vlq = require('vlq');


function transformMap(map) {
  return map.map(function (line) {
    return !line ? '' : line.map(section => section.map(item => vlq.encode(item)).join('')).join();
  }).join(';')+';';
}


export default class SourceMapper {
	constructor({ bootstrap }) {
		this.files = [];
    this.content = [];
    this.output = [];
    this.map = [];
    this.hasBootstrap = !!bootstrap;

    if (bootstrap) {
      this.files.push(bootstrap.filename);
      this.content.push(bootstrap.content);
    }

    this.pos = {
      src: {
        file: 0,
        line: 0,
        column: 0,
      },
      output: {
        line: 0,
        column: 0,
        prevColumn: 0,
      },
    };

	}


  addFile({ filename, content }) {
    this.files.push(filename);
    this.content.push(content);
  }


  pushCode({ output, srcFilename, srcLine, srcColumn, isBootstrap }) {
    const fileIndex = this.files.findIndex(filename => filename === srcFilename);
    if (fileIndex === -1) {
      throw new ReferenceError(`Unknown source filename: ${srcFilename}`);
    }

    let itemMap;
    // if (isBootstrap) {
      // itemMap = [this.pos.output.column - this.pos.output.prevColumn]; 
    // } else {
      itemMap = [this.pos.output.column - this.pos.output.prevColumn, fileIndex - this.pos.src.file, srcLine - this.pos.src.line, srcColumn - this.pos.src.column];
      // }

    const lineMap = this.map[this.pos.output.line] || (this.map[this.pos.output.line] = []);
    const lines = output.split('\n');

    this.output.push(output);
    lineMap.push(itemMap);

    // if (!isBootstrap) {
      this.pos.src.file = fileIndex;
      this.pos.src.line = srcLine;
      this.pos.src.column = srcColumn;
    // }
    
    this.pos.output.line += lines.length - 1;
    this.pos.output.prevColumn = this.pos.output.column;

    if (lines.length === 1) {
      this.pos.output.column += output.length;
    } else {
      this.pos.output.prevColumn = 0
      this.pos.output.column = lines[lines.length - 1].length;
    }

  }


  pushTree({ tree, filename }) {
    tree.code.forEach(item => {
      if (typeof item === 'string') {
        this.pushCode({
          output: item,
          srcFilename: filename, 
          srcLine: tree.location.start.line - 1,
          srcColumn: tree.location.start.column,
        });

      } else {
        this.pushTree({ tree: item, filename });
      }
    });
  }


  pushBootstrap(output) {
    if (!this.hasBootstrap) {
      throw new ReferenceError('Source mapper does have a bootstrap file');
    } 

    this.pushCode({ 
      output, 
      srcFilename: this.files[0],
      srcLine: 0,
      srcColumn: 0,
      isBootstrap: true,
    });
	}


  _renderSourceMap({ outputFilename }) {
    return JSON.stringify({
      version : 3,
      file: outputFilename,
      sourceRoot : '',
      sources: this.files,
      sourcesContent: this.content,
      names: [],
      mappings: transformMap(this.map),
    });
  }


  render({ outputFilename }) {
    return {
      output: this.output.join(''),
      sourceMap: this._renderSourceMap({ outputFilename }),
    };
  }

}