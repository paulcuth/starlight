var vlq = require('vlq');


function transformMap(map) {
  return map.map(function (line) {
    return !line ? '' : line.map(section => section.map(item => vlq.encode(item)).join('')).join();
  }).join(';')+';';
}


export default class SourceMapper {

	constructor() {
		this.files = [];
    this.content = [];
    this.output = [];
    this.map = [];

    this.pos = {
      src: {
        file: 0,
        line: 0,
        column: 0,
      },
      lastOutput: {
        line: 0,
        column: 0,
        prevColumn: 0,
      },
      output: {
        line: 0,
        column: 0,
      },
    };

	}


  addFile({ filename, content }) {
    this.files.push(filename);
    this.content.push(content);
  }


  pushCode({ output, srcFilename, srcLine, srcColumn, notMapped }) {
    const fileIndex = this.files.findIndex(filename => filename === srcFilename);
    if (!notMapped && fileIndex === -1) {
      throw new ReferenceError(`Unknown source filename: ${srcFilename}`);
    }

    const itemMap = [this.pos.lastOutput.column - this.pos.lastOutput.prevColumn, fileIndex - this.pos.src.file, srcLine - this.pos.src.line, srcColumn - this.pos.src.column];
    const lineMap = this.map[this.pos.output.line] || (this.map[this.pos.output.line] = []);
    const lines = output.split('\n');

    this.output.push(output);
    this.pos.output.line += lines.length - 1;
 
    if (lines.length === 1) {
      this.pos.output.column += output.length;
    } else {
      this.pos.lastOutput.prevColumn = 0;
      this.pos.lastOutput.column = lines[lines.length - 1].length;
      this.pos.output.column = this.pos.lastOutput.column;      
    }

    if (!notMapped) {
      lineMap.push(itemMap);

      this.pos.src.file = fileIndex;
      this.pos.src.line = srcLine;
      this.pos.src.column = srcColumn;

      this.pos.lastOutput = {
        ...this.pos.output,
        prevColumn: this.pos.lastOutput.column,
      };
    }

  }


  pushTree({ tree, filename }) {
    tree.code.forEach((item, index) => {
      if (typeof item === 'string') {
        this.pushCode({
          output: item,
          srcFilename: filename, 
          srcLine: tree.location.start.line - 1,
          srcColumn: tree.location.start.column,
          notMapped: tree.notMapped,
        });

      } else {
        this.pushTree({ tree: item, filename });
      }
    });
  }


  pushBootstrap(output) {
    this.pushCode({ 
      output, 
      srcFilename: this.files[0],
      srcLine: 0,
      srcColumn: 0,
      notMapped: true,
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