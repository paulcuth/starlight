--------------------------------------------------------------------------
-- Moonshine - a Lua virtual machine.
--
-- Email: moonshine@gamesys.co.uk
-- http://moonshinejs.org
--
-- Copyright (c) 2013-2015 Gamesys Limited. All rights reserved.
--
-- Permission is hereby granted, free of charge, to any person obtaining
-- a copy of this software and associated documentation files (the
-- "Software"), to deal in the Software without restriction, including
-- without limitation the rights to use, copy, modify, merge, publish,
-- distribute, sublicense, and/or sell copies of the Software, and to
-- permit persons to whom the Software is furnished to do so, subject to
-- the following conditions:
--
-- The above copyright notice and this permission notice shall be
-- included in all copies or substantial portions of the Software.
--
-- THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
-- EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
-- MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
-- IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
-- CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
-- TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
-- SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
--


local b = 20

function addOne ()
	assertTrue (b == 20, 'Functions should be able to access locals of parent closures [1]')
	
	function nested ()
		assertTrue (b == 20, 'Functions should be able to access locals of parent closures [2]')
		
		local c = 9
		assertTrue (c == 9, 'Functions should be able to access their own locals')
	end
	
	nested ()
	assertTrue (c == nil, 'Function locals should not be accessible from outside the function')
	
	b = b + 1
	assertTrue (b == 21, 'Operations performed on upvalues should use external value')
end

addOne ()
assertTrue (b == 21, 'Operations performed on upvalues in functions should affect the external value too')


function f (...)
	local a, b, c = ...	
	assertTrue (a == -1, 'Varargs should pass values around correctly [1]')
	assertTrue (b == 0, 'Varargs should pass values around correctly [2]')
	assertTrue (c == 2, 'Varargs should pass values around correctly [3]')

	local d, e, f, g, h = ...
	assertTrue (d == -1, 'Varargs should pass values around correctly [4]')
	assertTrue (e == 0, 'Varargs should pass values around correctly [5]')
	assertTrue (f == 2, 'Varargs should pass values around correctly [6]')
	assertTrue (g == 9, 'Varargs should pass values around correctly [7]')
	assertTrue (h == nil, 'Varargs should pass nil for list entries beyond its length')
end

f(-1,0,2,9)


function g (a, ...)
	local b, c = ...	
	assertTrue (a == -1, 'Varargs should pass values around correctly [8]')
	assertTrue (b == 0, 'Varargs should pass values around correctly [9]')
	assertTrue (c == 2, 'Varargs should pass values around correctly [10]')
end

g(-1,0,2,9)


function h (a, b, ...)
	local c = ...	
	assertTrue (a == -1, 'Varargs should pass values around correctly [11]')
	assertTrue (b == 0, 'Varargs should pass values around correctly [12]')
	assertTrue (c == 2, 'Varargs should pass values around correctly [13]')
end

h(-1,0,2,9)


function getFunc ()
	local b = 6
	return function () return b end
end

x = getFunc () ()
assertTrue (x == 6, 'Functions should be able to return functions (and maintain their scope)')



function add (val1)
	return function (val2) return val1 + val2 end
end

local addThree = add (3)
x = addThree (4)

assertTrue (x == 7, 'Functions should be able to be curried')


do
	local function x()
		return 'inner'
	end

	function y()
		return x()
	end
end

function x()
	return 'outer'
end

local z = y()
assertTrue (z == 'inner', 'Local functions should be locally scoped')


function oneTwo() 
	return 1, 2
end

function testReturnValues()
	return oneTwo(), 10
end

local a, b, c = testReturnValues()
assertTrue (a == 1, 'return should return the first item returned from a function call')
assertTrue (b == 10, 'return should only return the first item from a function call when not last item in an expression list')
assertTrue (c == nil, 'return should know when to stop')

function testReturnValues2()
	return 10, oneTwo()
end

local a, b, c = testReturnValues2()
assertTrue (a == 10, 'return should return the first item in an expression list')
assertTrue (b == 1, 'return should return the first item from a function call')
assertTrue (c == 2, 'return should return all items returned from a function call if at end of expression list')

function testArgs1(a, b, c)
	assertTrue (a == 1, 'Function call in argument list should pass return value as argument')
	assertTrue (b == 10, 'Function call in middle of argument list should only pass one argument')
	assertTrue (c == nil, 'Arguments should stop at the end of argument list')
end
testArgs1(oneTwo(), 10)

function testArgs2(a, b, c)
	assertTrue (a == 10, 'Arguments should be passed in order')
	assertTrue (b == 1, 'Function call should pass return values')
	assertTrue (c == 2, 'Function call at end of argument list should pass all return values')
end
testArgs2(10, oneTwo())
