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


local a = 1
assertTrue (a == 1, 'Local should retain value')

local a, b = 12, 34
a, b = b, a
assertTrue (a == 34, 'Assignment should be able to reverse values [1]')
assertTrue (b == 12, 'Assignment should be able to reverse values [2]')

local a, b, c, d = 5, 20, 0, nil
assertTrue (a == 5, 'Local should change value')
assertTrue (b == 20, 'Local should accept multiple assignments')

local result = a + b
assertTrue (result == 25, 'Plus operator should result in addition of operands')

result = a - b
assertTrue (result == -15, 'Minus operator should result in subtraction of operands')

result = a * b
assertTrue (result == 100, 'Asterisk operator should result in multiplication of operands')


result = b / a
assertTrue (result == 4, 'Slash operator should result in division of operands')

result = a / b
assertTrue (result == .25, 'Division should handle floating point results')

result = a / c
assertTrue (result == math.huge, 'Division by zero should return infinity')

result = a / -c
assertTrue (result == -math.huge, 'Division by negative zero should return negative infinity')

xpcall(function () result = a / d end, function () result = 'failed' end)
assertTrue (result == 'failed', 'Division by nil should error')

xpcall(function () result = a / 'x' end, function () result = 'failed2' end)
assertTrue (result == 'failed2', 'Division by string value should error')

xpcall(function () result = 'x' / a end, function () result = 'failed3' end)
assertTrue (result == 'failed3', 'Division of string value should error')


result = 5 % 3
assertTrue (result == 2, 'Modulo operator should return the remainder of the division of the two operands')

result = #'moo\0moo'
assertTrue (result == 7, 'Length operator should return the correct length of string with null character inside')

result = #'moo\0'
assertTrue (result == 4, 'Length operator should return the correct length of string with null character appended')

function testUnpack()
	return 1, 2, 3
end

local a, b, c = testUnpack(), 8
assertTrue (a == 1, 'Local assignment should extract the first return value of a function call [1]')
assertTrue (b == 8, 'Local assignment should only extract the first return value when function call not at end of expression list')
assertTrue (c == nil, 'Local assignment should know when to stop')

local a, b, c = 8, testUnpack()
assertTrue (a == 8, 'Local assignment should set the first value from expression list')
assertTrue (b == 1, 'Local assignment should extract the first return value of a function call [2]')
assertTrue (c == 2, 'Local assignment should extract all return values when function call at end of expression list')

local a, b, c
do
  a, b, c = testUnpack(), 8
  assertTrue (a == 1, 'Assignment should extract the first return value of a function call [1]')
  assertTrue (b == 8, 'Assignment should only extract the first return value when function call not at end of expression list')
  assertTrue (c == nil, 'Assignment should know when to stop')

  a, b, c = 8, testUnpack()
  assertTrue (a == 8, 'Assignment should set the first value from expression list')
  assertTrue (b == 1, 'Assignment should extract the first return value of a function call [2]')
  assertTrue (c == 2, 'Assignment should extract all return values when function call at end of expression list')
end



a = 5
b = 20
do
	local a = 5
	local b = 3
	local c = 5.5
	local d = 23
	local e = 7
	local f = 0
	local g = 0 / 0 	-- nan
	local h = math.huge
	local i = -math.huge


	assertEqual (a % b, 2, 'Modulo operator should return the remainder of the division of the two operands')
	assertEqual (c % b, 2.5, 'Modulo operator should return the fraction part of the remainder of the division of the two operands')
	assertEqual (-d % e, 5, 'Modulo operator should always return a positive number if the divisor is positive and wrap around if passed a negative dividend')
	assertEqual (d % -e, -5, 'Modulo operator should always return a negative number if the divisor is negative')
	assertEqual (-d % -e, -2, 'Modulo operator should always wrap around when passed a negative dividend')

	assertEqual (d % f, g, 'Modulo operator should always return "nan" when passed zero as a divisor')
	assertEqual (f % d, 0, 'Modulo operator should return zero when passed zero as a dividend (unless divisor == 0)')
	assertEqual (f % f, g, 'Modulo operator should return "nan" when passed zero as a dividend and divisor')
	assertEqual (d % g, g, 'Modulo operator should return "nan" when passed "nan" as a divisor')
	assertEqual (g % d, g, 'Modulo operator should return "nan" when passed "nan" as a dividend')
	assertEqual (d % h, g, 'Modulo operator should return "nan" when passed "inf" as a divisor')
	assertEqual (h % d, g, 'Modulo operator should return "nan" when passed "inf" as a dividend')
	assertEqual (d % i, g, 'Modulo operator should return "nan" when passed "-inf" as a divisor')
	assertEqual (i % d, g, 'Modulo operator should return "nan" when passed "-inf" as a dividend')

end

assertTrue (a == a, 'Equality operator should return true if first operand is equal to second')
assertTrue (not (a == b), 'Equality operator should return false if first operand is not equal to second')

assertTrue (a < b, 'Less than should return true if first operand is less than second')
assertTrue (not (a < a), 'Less than should return false if first operand is equal to second')
assertTrue (not (b < a), 'Less than should return false if first operand is greater than second')

assertTrue (b > a, 'Greater than should return true if first operand is Greater than second')
assertTrue (not (a > a), 'Greater than should return false if first operand is equal to second')
assertTrue (not (a > b), 'Greater than should return false if first operand is less than second')

assertTrue (a <= b, 'Less than or equal to should return true if first operand is less than second')
assertTrue (a <= a, 'Less than or equal to should return true if first operand is equal to second')
assertTrue (not (b <= a), 'Less than or equal to should return false if first operand is greater than second')

assertTrue (b >= a, 'Greater than or equal to should return true if first operand is Greater than second')
assertTrue (a >= a, 'Greater than or equal to should return true if first operand is equal to second')
assertTrue (not (a >= b), 'Greater than or equal to should return false if first operand is less than second')

local t = true
local f = false
local n

assertTrue (t, 'True should be true')
assertTrue (0, '0 should coerce to true')
assertTrue (1, '1 should coerce to true')
assertTrue ('moo', 'A string should coerce to true')
assertTrue ('', 'An empty string should coerce to true')
assertTrue ({}, 'An empty table should coerce to true')

assertTrue (not f, 'False should coerce to false')
assertTrue (not n, 'nil should coerce to false')


assertTrue (t and t, 'And operator should return true if both operands are true')
assertTrue (not (f and t), 'And operator should return false if first operand is false')
assertTrue (not (t and f), 'And operator should return false if second operand is false')
assertTrue (not (f and f), 'And operator should return false if both operands are false')

assertTrue (t or t, 'Or operator should return true if both operands are true')
assertTrue (f or t, 'Or operator should return true even if first operand is false')
assertTrue (t or f, 'Or operator should return true even if second operand is false')
assertTrue (not (f or f), 'Or operator should return false if both operands are false')

assertEqual(t and 0 or 1, 0, 'Ternary logic should return the correct result[1]')
assertEqual(f and 0 or 1, 1, 'Ternary logic should return the correct result[2]')

function f(x)
	return x
end

assertEqual (f('moo') or false, 'moo', 'Or operator should work with function calls as left operand (+ve)')
assertEqual (f(false) or false, false, 'Or operator should work with function calls as left operand (-ve)')
assertEqual (false or f('moo'), 'moo', 'Or operator should work with function calls as right operand (+ve)')
assertEqual (false or f(false), false, 'Or operator should work with function calls as right operand (-ve)')
assertEqual (f(false) or f('moo'), 'moo', 'Or operator should work with function calls as both operands')

assertEqual (f('moo') and 'baa', 'baa', 'And operator should work with function calls as left operand (+ve)')
assertEqual (f(false) and true, false, 'And operator should work with function calls as left operand (-ve)')
assertEqual (true and f('moo'), 'moo', 'And operator should work with function calls as right operand (+ve)')
assertEqual (true and f(false), false, 'And operator should work with function calls as right operand (-ve)')
assertEqual (f('moo') and f('moo'), 'moo', 'And operator should work with function calls as both operands')


local function test()
    return true
end

assertTrue(test() and true, 'Should allow function calls as first operand in boolean operations')
assertTrue(true and test(), 'Should allow function calls as second operand in boolean operations')


local tests = {
	addition = function (a, b) return a + b end,
	subtraction = function (a, b) return a - b end,
	muliplication = function (a, b) return a * b end,
	division = function (a, b) return a / b end,
	modulus = function (a, b) return a % b end,
	pow = function (a, b) return a ^ b end,
	['unary-minus'] = function (a, b) return -a, -b end
}

for name, test in pairs(tests) do

	local success, result = pcall (test, 5, 2)
	assertTrue (success, 'Simple use of '..name..' operator should not fail')
	
	success, result = pcall (test, '3', 6)
	assertTrue (success, 'Applying '..name..' operator to a string containing a number should not error [1]')
	
	success, result = pcall (test, '3.', 9)
	assertTrue (success, 'Applying '..name..' operator to a string containing a number should not error [2]')
	
	success, result = pcall (test, '3.2', 9)
	assertTrue (success, 'Applying '..name..' operator to a string containing a number should not error [3]')
	
	success, result = pcall (test, '3.2e4', 9)
	assertTrue (success, 'Applying '..name..' operator to a string containing an exponenial number should not error [4]')
	
	success, result = pcall (test, 8, '2')
	assertTrue (success, 'Passing a string containing a number to the '..name..' operator should not error [1]')
	
	success, result = pcall (test, 1, '2.')
	assertTrue (success, 'Passing a string containing a number to the '..name..' operator should not error [2]')
	
	success, result = pcall (test, 1, '2.5')
	assertTrue (success, 'Passing a string containing a number to the '..name..' operator should not error [3]')
	
	success, result = pcall (test, 1, '2.5e3')
	assertTrue (success, 'Passing a string containing an exponential number to the '..name..' operator should not error [4]')
	
	success, result = pcall (test, '9', '2')
	assertTrue (success, 'Applying '..name..' operator to two strings containing a numbers should not error')
	
	success, result = pcall (test, 'a', 2)
	assertTrue (not success, 'Applying '..name..' operator to an alpha string should error [1]')
	
	success, result = pcall (test, '8a', 2)
	assertTrue (not success, 'Applying '..name..' operator to an alpha string should error [2]')
	
	success, result = pcall (test, 'a8', 2)
	assertTrue (not success, 'Applying '..name..' operator to an alpha string should error [3]')
	
	success, result = pcall (test, 8, '2a')
	assertTrue (not success, 'Passing an alpha string to the '..name..' operator should error')
	
end

assertTrue('abc' < 'def', 'Strings should be comparable')

local a = '\t'
local b = [[\n\t]]
local c = [[\]]
local d = '\32'
local e = [[\32]]
local f = '\0321'

assertTrue(a == '	', 'A quoted string literal should escape chars after backslash')
assertTrue(b == '\\n\\t', 'A long bracketed string literal should not escape chars after backslash [1]')
assertTrue(c == '\\', 'A long bracketed string literal should not escape chars after backslash [2]')

assertTrue(d == ' ', 'An escaped number should be converted to a char in quoted string literals')
assertTrue(e == '\\32', 'An escaped number should not be converted to a char in long bracketed string literals')
assertTrue(f == ' 1', 'An escaped number should only consume 3 digits in quoted string literals')
