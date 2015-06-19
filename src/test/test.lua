
do
	local passed, failed = 0, 0

	function assertTrue (condition, message)
		if not condition then 
			failed = failed + 1
			reportError(message)
		else
			passed = passed + 1
		end
	end
	
	function assertEqual (actual, expected, message)
		if actual ~= expected and (actual == actual or expected == expected) then 
			failed = failed + 1
			reportError(message..'; expected "'..tostring(expected)..'", got "'..tostring(actual)..'".')
		else
			passed = passed + 1
		end
	end

	function reportError (message)
		print('- '..message)
	end

	function showResults ()		
		local durationStr = ''

		print "\n------------------------"
		if failed == 0 then
			print " Passed."
		else
			print "FAILED!"
		end

		print "------------------------\n"		
		print ("Total asserts: "..(passed + failed).."; Passed: "..passed.."; Failed: "..failed..durationStr)
	end

end


local a = 1
assertTrue (a == 1, 'Local should retain value')

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


-------------------
-- Funcions
-------------------

c = nil
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

-- x = getFunc () ()
-- assertTrue (x == 6, 'Functions should be able to return functions (and maintain their scope)')



function add (val1)
	return function (val2) return val1 + val2 end
end

local addThree = add (3)
x = addThree (4)

assertTrue (x == 7, 'Functions should be able to be curried')



---------------
-- Tables
---------------


a = {1,2,3,4}
b = a

assertTrue (a == b, 'Tables should be able to be compared by identity')
assertTrue (not (a == {1,2,3,4}), 'Tables should not be able to be compared to literals')
assertTrue (#a == 4, 'Length operator should return the number of items in a table')


assertTrue (a[1] == 1, 'Square brackets operation on table should return correct value for index [1]')
assertTrue (a[2] == 2, 'Square brackets operation on table should return correct value for index [2]')
assertTrue (a[3] == 3, 'Square brackets operation on table should return correct value for index [3]')
assertTrue (a[4] == 4, 'Square brackets operation on table should return correct value for index [4]')
assertTrue (a[5] == nil, 'Square brackets operation on table should return nil for an index greater than the length')
assertTrue (a[0] == nil, 'Square brackets operation on table should return nil for an index of 0')
assertTrue (a[-1] == nil, 'Square brackets operation on table should return nil for an index less than 0')


a = {[1] = 20, [3] = 40}
assertTrue (a[1] == 20, 'Square brackets operation on table should return correct value for index when keys are used in literal assignment [1]')
assertTrue (a[2] == nil, 'Square brackets operation on table should return correct value for index when keys are used in literal assignment [2]')
assertTrue (a[3] == 40, 'Square brackets operation on table should return correct value for index when keys are used in literal assignment [3]')
assertTrue (a[4] == nil, 'Square brackets operation on table should return correct value for index when keys are used in literal assignment [4]')




-- -- TABLES


Account = { balance = 0 }

function Account:new (o)
	o = o or {}
	setmetatable (o,self)
	self.__index = self
	return o
end 

function Account:deposit (v)
	self.balance = self.balance + v
end

function Account:withdraw (v)
	if v > self.balance then error "insufficient funds" end
	self.balance = self.balance - v
end


acc = Account:new ()

assertTrue (acc.balance == 0, 'Class properties should be initiated when instantiated [1]')

acc:deposit (20)
assertTrue (acc.balance == 20, 'Class instance properties should be updatable though instance method calls [1]')

acc:withdraw (5)
assertTrue (acc.balance == 15, 'Class instance properties should maintain their value in the instance')


acc2 = Account:new ()

assertTrue (acc2.balance == 0, 'Class properties should be initiated when instantiated [2]')

acc2:deposit (50)
assertTrue (acc2.balance == 50, 'Class instance properties should be updatable though instance method calls [2]')
assertTrue (acc.balance == 15, 'Class instance properties should maintain their value separate to other instances')



SpecialAccount = Account:new ()

function SpecialAccount:withdraw (v)
	if v - self.balance >= self:getLimit () then
		error "insufficient funds"
	end
	
	self.balance = self.balance - v
end

function SpecialAccount:getLimit ()
	return self.limit or 0
end


s = SpecialAccount:new {limit=1000.00}

assertTrue (s.balance == 0, 'Class properties should be initiated when instantiated, even if class is inherited')
assertTrue (s:getLimit () == 1000, 'Inherited class should have its own properties')
assertTrue (acc.getLimit == nil, 'Base class properties should not change when inherited class manipulated')

s:deposit (500)
assertTrue (s.balance == 500, 'Class instance properties should be updatable though instance method calls [3]')


function f () 
	return 1, 3, 9
end

local t = {f()}

assertTrue (t[1] == 1, 'Table should be able to be instantiated by the result of a function [1]')
assertTrue (t[2] == 3, 'Table should be able to be instantiated by the result of a function [2]')
assertTrue (t[3] == 9, 'Table should be able to be instantiated by the result of a function [3]')



t = {}
t[1] = 'number'
t['1'] = 'string'

assertTrue (t[1] == 'number', 'A numerical table index should return a different value than when using the same index as a sting. [1]')
assertTrue (t['1'] == 'string', 'A numerical table index should return a different value than when using the same index as a sting. [2]')



---------------------------
-- Control structures
---------------------------


local a, b, i = 0, 0, 0

for i = 1, 5 do
	a = a + 1
	b = b + i
end

assertTrue (a == 5, 'For loop should iterate the correct number of times')
assertTrue (b == 15, 'For loop variable should hold the value of the current iteration')


a = { a = 1, b = 2 }
b = 0

for _ in pairs(a) do b = b + 1 end

assertTrue (b == 2, 'For block should iterate over all properties of a table')


a.a = nil
b = 0

for _ in pairs(a) do b = b + 1 end

assertTrue (b == 1, 'Setting a table property to nil should remove that property from the table.')



b = {}

for i = 1, 3 do
	local c = i
	b[i] = function() return c end
end

assertTrue (b[1]() == 1, 'Local within a for loop closure should keep its value [1]')
assertTrue (b[2]() == 2, 'Local within a for loop closure should keep its value [2]')
assertTrue (b[3]() == 3, 'Local within a for loop closure should keep its value [3]')


a = ''
u = {['@!#'] = 'qbert', [{}] = 1729, [6.28] = 'tau', [function () end] = 'test'}

for key, val in pairs(u) do
	a = a..'['..tostring(key)..'=='..tostring(val)..']'
end

assertTrue (string.find(a, '[6.28==tau]') ~= nil, 'for/pairs iteration should include items with double as key.')
assertTrue (string.find(a, '[@!#==qbert]') ~= nil, 'for/pairs iteration should include items with string as key.')
assertTrue (string.find(a, '[table: 0x%d+==1729]') ~= nil, 'for/pairs iteration should include items with table as key.')
assertTrue (string.find(a, '[function: 0x%d+==test]') ~= nil, 'for/pairs iteration should include items with function as key.')


a = ''
b = 1
while #a < 15 do
	a = a..b
	b = b + 1
end

assertEqual (a, '123456789101112', 'While loop should iterate until condition is met')

local fail = false
while b < 0 do
	fail = true
end

assertEqual (fail, false, 'While loop should not iterate if condition is never met')

b = {}
i = 1
while i < 4 do
	local c = i
	b[i] = function() return c end
	i = i + 1
end

assertTrue (b[1]() == 1, 'Local within a while loop closure should keep its value [1]')
assertTrue (b[2]() == 2, 'Local within a while loop closure should keep its value [2]')
assertTrue (b[3]() == 3, 'Local within a while loop closure should keep its value [3]')



a = ''
b = 1
repeat
	a = a..b
	b = b + 1
until #a > 15

assertEqual (a, '12345678910111213', 'Repeat loop should iterate until condition is met')

b = 1
repeat
	b = b + 1
until b > 0

assertEqual (b, 2, 'Repeat loop should iterate once if condition is always met')

b = {}
i = 1
repeat
	local c = i
	b[i] = function() return c end
	i = i + 1
until i == 4

assertTrue (b[1]() == 1, 'Local within a while loop closure should keep its value [1]')
assertTrue (b[2]() == 2, 'Local within a while loop closure should keep its value [2]')
assertTrue (b[3]() == 3, 'Local within a while loop closure should keep its value [3]')

a = ':'
t = { 123, 456, x = 789, 10 }
for i, v in ipairs(t) do
	a = a..i..'='..v..':'
end

assertTrue (string.find(a, ':1=123:') ~= nil, 'for-in-ipairs loop should iterate over numeric keys [1]')
assertTrue (string.find(a, ':2=456:') ~= nil, 'for-in-ipairs loop should iterate over numeric keys [2]')
assertTrue (string.find(a, ':3=10:') ~= nil, 'for-in-ipairs loop should iterate over numeric keys [3]')
assertTrue (string.find(a, ':x=789:') == nil, 'for-in-ipairs loop should not iterate over non-numeric keys')
assertEqual (a, ':1=123:2=456:3=10:', 'for-in-ipairs loop should iterate over numeric keys in order')








-- Coercion

assertTrue (0, 'Zero should coerce to true.')
assertTrue (1, 'Positive number should coerce to true.')
assertTrue (-1, 'Negative number should coerce to true.')
assertTrue ('Test', 'String should coerce to true.')
assertTrue ('', 'Empty string should coerce to true.')

assertTrue (0 + '123' == 123, 'Integer strings should coerce to integers')
assertTrue (0 + '123.45' == 123.45, 'Floating point strings should coerce to floats')
assertTrue (0 + '0xa' == 10, 'Hexidecimal syntax strings should coerce to decimal integers')
assertTrue (0 + '0xa.2' == 10.125, 'Floating point hexidecimal syntax strings should coerce to decimal floats')
assertTrue (0 + '0123' == 123, 'JS Octal syntax strings should be coerced as normal decimal strings in Lua')

assertTrue (0 + '-123' == -123, 'Negative integer strings should coerce to negative integers')
assertTrue (0 + '-0xa.2' == -10.125, 'Negative floating point hexidecimal syntax strings should coerce to negative decimal floats')
assertTrue (0 + 'inf' == math.huge, '"inf" should coerce to inf')
assertTrue (0 + '-inf' == -math.huge, '"-inf" should coerce to negative inf')

local a = 0 + 'nan'
assertTrue (a ~= a, '"nan" should coerce to nan')


assertTrue (not (nil), 'Nil should coerce to false.')
assertTrue (not (false), 'False should be false.')
assertTrue (not (10 == '10'), 'String should coerce to number.')



-- TYPE ERRORS

function conc (a, b)
	return a..b
end

a = pcall (conc, 'a', 'b')
b = pcall (conc, 'a', 44)
c = pcall (conc, 55, 'b')
d = pcall (conc, 55, 44)
e = pcall (conc, 'a', {})
f = pcall (conc, {}, 'b')
g = pcall (conc, 'a', os.date)

assertTrue (a, 'Concatenation should not error with two strings')
assertTrue (b, 'Concatenation should not error with a string and a number')
assertTrue (c, 'Concatenation should not error with a number and a string')
assertTrue (d, 'Concatenation should not error with two numbers')
assertTrue (not (e), 'Concatenation should error with a string and a table')
assertTrue (not (f), 'Concatenation should error with a table and a string')
assertTrue (not (g), 'Concatenation should error with a string and a function')


function add (a, b)
	return a + b
end

a = pcall (add, 'a', 'b')
b = pcall (add, 'a', 44)
c = pcall (add, 55, 'b')
d = pcall (add, 55, 44)
e = pcall (add, 'a', {})
f = pcall (add, {}, 'b')
g = pcall (add, 'a', os.date)

assertTrue (not (a), 'Addition operator should error with two strings')
assertTrue (not (b), 'Addition operator should error with a string and a number')
assertTrue (not (c), 'Addition operator should error with a number and a string')
assertTrue (d, 'Addition operator should not error with two numbers')
assertTrue (not (e), 'Addition operator should error with a string and a table')
assertTrue (not (f), 'Addition operator should error with a table and a string')
assertTrue (not (g), 'Addition operator should error with a string and a function')


function sub (a, b)
	return a - b
end

a = pcall (sub, 'a', 'b')
b = pcall (sub, 'a', 44)
c = pcall (sub, 55, 'b')
d = pcall (sub, 55, 44)
e = pcall (sub, 'a', {})
f = pcall (sub, {}, 'b')
g = pcall (sub, 'a', os.date)

assertTrue (not (a), 'Subtraction operator should error with two strings')
assertTrue (not (b), 'Subtraction operator should error with a string and a number')
assertTrue (not (c), 'Subtraction operator should error with a number and a string')
assertTrue (d, 'Subtraction operator should not error with two numbers')
assertTrue (not (e), 'Subtraction operator should error with a string and a table')
assertTrue (not (f), 'Subtraction operator should error with a table and a string')
assertTrue (not (g), 'Subtraction operator should error with a string and a function')


function mult (a, b)
	return a * b
end

a = pcall (mult, 'a', 'b')
b = pcall (mult, 'a', 44)
c = pcall (mult, 55, 'b')
d = pcall (mult, 55, 44)
e = pcall (mult, 'a', {})
f = pcall (mult, {}, 'b')
g = pcall (mult, 'a', os.date)

assertTrue (not (a), 'Multiplication operator should error with two strings')
assertTrue (not (b), 'Multiplication operator should error with a string and a number')
assertTrue (not (c), 'Multiplication operator should error with a number and a string')
assertTrue (d, 'Multiplication operator should not error with two numbers')
assertTrue (not (e), 'Multiplication operator should error with a string and a table')
assertTrue (not (f), 'Multiplication operator should error with a table and a string')
assertTrue (not (g), 'Multiplication operator should error with a string and a function')


function divide (a, b)
	return a / b
end

a = pcall (divide, 'a', 'b')
b = pcall (divide, 'a', 44)
c = pcall (divide, 55, 'b')
d = pcall (divide, 55, 44)
e = pcall (divide, 'a', {})
f = pcall (divide, {}, 'b')
g = pcall (divide, 'a', os.date)

assertTrue (not (a), 'Division operator should error with two strings')
assertTrue (not (b), 'Division operator should error with a string and a number')
assertTrue (not (c), 'Division operator should error with a number and a string')
assertTrue (d, 'Division operator should not error with two numbers')
assertTrue (not (e), 'Division operator should error with a string and a table')
assertTrue (not (f), 'Division operator should error with a table and a string')
assertTrue (not (g), 'Division operator should error with a string and a function')


function modu (a, b)
	return a % b
end

a = pcall (modu, 'a', 'b')
b = pcall (modu, 'a', 44)
c = pcall (modu, 55, 'b')
d = pcall (modu, 55, 44)
e = pcall (modu, 'a', {})
f = pcall (modu, {}, 'b')
g = pcall (modu, 'a', os.date)

assertTrue (not (a), 'Modulo operator should error with two strings')
assertTrue (not (b), 'Modulo operator should error with a string and a number')
assertTrue (not (c), 'Modulo operator should error with a number and a string')
assertTrue (d, 'Modulo operator should not error with two numbers')
assertTrue (not (e), 'Modulo operator should error with a string and a table')
assertTrue (not (f), 'Modulo operator should error with a table and a string')
assertTrue (not (g), 'Modulo operator should error with a string and a function')


function power (a, b)
	return a ^ b
end

a = pcall (power, 'a', 'b')
b = pcall (power, 'a', 44)
c = pcall (power, 55, 'b')
d = pcall (power, 55, 44)
e = pcall (power, 'a', {})
f = pcall (power, {}, 'b')
g = pcall (power, 'a', os.date)

assertTrue (not (a), 'Exponentiation operator should error with two strings')
assertTrue (not (b), 'Exponentiation operator should error with a string and a number')
assertTrue (not (c), 'Exponentiation operator should error with a number and a string')
assertTrue (d, 'Exponentiation operator should not error with two numbers')
assertTrue (not (e), 'Exponentiation operator should error with a string and a table')
assertTrue (not (f), 'Exponentiation operator should error with a table and a string')
assertTrue (not (g), 'Exponentiation operator should error with a string and a function')


function neg (a)
	return -a
end

a = pcall (neg, 'a')
b = pcall (neg, 55)
c = pcall (neg, {})

assertTrue (not (a), 'Negation operator should error when passed a string')
assertTrue (b, 'Negation operator should not error when passed a number')
assertTrue (not (c), 'Negation operator should error when passed a table')








-- Event metametods

-- __index

local o = {}
local index = 'mogwai'
local returnVal = {}
local test
local x = {}


--nil
setmetatable(o, {})
assertTrue (o[index] == nil, 'Getting an index of an empty table with empty metamethod should return nil.')


--function
setmetatable(o, { __index = function (t, i)
	assertTrue (t == o, '__index function in metatable should be passed the table as first argument.')
	assertTrue (i == index, '__index function in metatable should be passed the index as second argument.')

	test = true
	return returnVal
end })

local result = o[index]
assertTrue (test, '__index function in metatable should be executed when table has no property by that index.')
assertTrue (result == returnVal, 'Value returned from __index function in metatable should be passed as the value')


--table
setmetatable(x, { __index = o });
test = false
result = x[index]

assertTrue (test, '__index function in metatable should be executed when table has no property by that index, even when nested.')
assertTrue (result == returnVal, 'Value returned from __index function in metatable should be passed as the value when nested')


--don't call if assigned
x[index] = 456

test = false
result = x[index]

assertTrue (not test, '__index function in metatable should not be executed when table has a property by that index.')
assertTrue (result == 456, '__index should be ignored when index is set.')


--test diffferent types of keys
setmetatable(o, { __index = function (t, i)
	test = true
	return returnVal
end })

test = false
result = o[123]

assertTrue (test, '__index function in metatable should be executed when table has no property by numerical index')
assertTrue (result == returnVal, 'Value returned from __index function in metatable should be passed as the value when index is numerical')

test = false
result = o[function () end]

assertTrue (test, '__index function in metatable should be executed when table has no property with a function key')
assertTrue (result == returnVal, 'Value returned from __index function in metatable should be passed as the value with a function key')

test = false
result = o[{}]

assertTrue (test, '__index function in metatable should be executed when table has no property with a table key')
assertTrue (result == returnVal, 'Value returned from __index function in metatable should be passed as the value with a table key')


-- nil (assigned)
getmetatable(o).__index = nil
assertTrue (o[index] == nil, 'When __index property of metatable is nil, value returned should be nil')



-- __newindex


--nil
o = {}
setmetatable(o, {})

o[index] = 123

assertTrue (o[index] == 123, 'Setting an index of an empty table with empty metamethod should set that value.')


--function
local value = {}
test = false
o = {}

setmetatable(o, { __newindex = function (t, i, v)
	assertTrue (t == o, '__newindex function in metatable should be passed the table as first argument.')
	assertTrue (i == index, '__newindex function in metatable should be passed the index as second argument.')
	assertTrue (v == value, '__newindex function in metatable should be passed the value as third argument.')

	test = true
	return returnVal
end })

o[index] = value

assertTrue (test, '__newindex function in metatable should be executed when table has no property by that index.')
assertTrue (o[index] == nil, '__newindex function should not set the value unless done so explicitly,')


--table does not have same effect as __index
x = {}
setmetatable(x, { __index = o });

test = false
x[index] = value

assertTrue (not test, '__newindex function in metatable should not be executed when nested.')
assertTrue (x[index] == value, '__newindex function in metatable should be be ignored when nested.')


--don't call if assigned
test = false
rawset(o, index, 111)
o[index] = value

assertTrue (not test, '__newindex function in metatable should not be executed when table has a property by that index.')
assertTrue (o[index] == value, '__newindex should be ignored when index is set.')


--test different types of keys
setmetatable(o, { __newindex = function (t, i, v)
	test = true
	return returnVal
end })

test = false
index = 123
o[index] = value
assertTrue (test, '__newindex function in metatable should be executed when table has not property for numerical key.')
assertTrue (o[index] == nil, '__newindex should return the correct value when passed a numerical key.')

test = false
index = function () end
o[index] = value
assertTrue (test, '__newindex function in metatable should be executed when table has not property for function key.')
assertTrue (o[index] == nil, '__newindex should return the correct value when passed a function key.')

test = false
index = {}
o[index] = value
assertTrue (test, '__newindex function in metatable should be executed when table has not property for table key.')
assertTrue (o[index] == nil, '__newindex should return the correct value when passed a table key.')


-- nil (assigned)
rawset(o, index, nil)
getmetatable(o).__index = nil
assertTrue (o[index] == nil, 'When __index property of metatable is nil, value returned should be nil')




-- metatable

local mt = { moo = '123' }
local fake = {}
local fake2 = {}
o = {}

setmetatable(o, mt)

result = getmetatable(o)
assertTrue (result == mt, 'getmetatable() should return metatable when __metatable is not set')

mt.__metatable = fake
result = getmetatable(o)
assertTrue (result ~= mt, 'getmetatable() should not return metatable when __metatable is set')
assertTrue (result == fake, 'getmetatable() should return the value of __metatable, if set')

local setmet = function ()
	setmetatable(o, mt)
end

local s, _ = pcall(setmet)
assertTrue (not s, 'setmetatable() should error when metatable has __metatable set')


mt.__metatable = function () return fake2 end
result = getmetatable(o)
assertTrue (result ~= fake2, 'getmetatable() should not return the value returned by __metatable, if it is set to a function')
assertTrue (type(result) == 'function', 'getmetatable() should return the value of __metatable, even if it is set to a function')






-- Arithmetic metamethods

local mt = {}
local Obj = {}

function Obj.new (v) 
	local self = { ['value'] = v }
	setmetatable (self, mt);
	return self
end

local o = Obj.new (3);
local p = Obj.new (5);
local x = { value = 'moo' }


-- __add

mt.__add = function (a, b)
	return a.value..'(__add)'..b.value
end

assertTrue (o + p == '3(__add)5', 'Add operator should use __add metamethod, if provided [1]')
assertTrue (o + x == '3(__add)moo', 'Add operator should use __add metamethod, if provided [2]')
assertTrue (x + p == 'moo(__add)5', 'Add operator should use __add metamethod, if provided [3]')




-- __concat

mt.__concat = function (a, b)
	return a.value..'(__concat)'..b.value
end
assertTrue (o..p == '3(__concat)5', 'Concatenation operator should use __concat metamethod, if provided [1]')
assertTrue (o..x == '3(__concat)moo', 'Concatenation operator should use __concat metamethod, if provided [2]')
assertTrue (x..p == 'moo(__concat)5', 'Concatenation operator should use __concat metamethod, if provided [3]')




-- __div

mt.__div = function (a, b)
	return a.value..'(__div)'..b.value
end

assertTrue (o / p == '3(__div)5', 'Divide operator should use __div metamethod, if provided [1]')
assertTrue (o / x == '3(__div)moo', 'Divide operator should use __div metamethod, if provided [2]')
assertTrue (x / p == 'moo(__div)5', 'Divide operator should use __div metamethod, if provided [3]')




-- __mod

mt.__mod = function (a, b)
	return a.value..'(__mod)'..b.value
end

assertTrue (o % p == '3(__mod)5', 'Modulo operator should use __mod metamethod, if provided [1]')
assertTrue (o % x == '3(__mod)moo', 'Modulo operator should use __mod metamethod, if provided [2]')
assertTrue (x % p == 'moo(__mod)5', 'Modulo operator should use __mod metamethod, if provided [3]')




-- __mul

mt.__mul = function (a, b)
	return a.value..'(__mul)'..b.value
end

assertTrue (o * p == '3(__mul)5', 'Muliplication operator should use __mul metamethod, if provided [1]')
assertTrue (o * x == '3(__mul)moo', 'Muliplication operator should use __mul metamethod, if provided [2]')
assertTrue (x * p == 'moo(__mul)5', 'Muliplication operator should use __mul metamethod, if provided [3]')




-- __pow

mt.__pow = function (a, b)
	return a.value..'(__pow)'..b.value
end

assertTrue (o ^ p == '3(__pow)5', 'Exponentiation operator should use __pow metamethod, if provided [1]')
assertTrue (o ^ x == '3(__pow)moo', 'Exponentiation operator should use __pow metamethod, if provided [2]')
assertTrue (x ^ p == 'moo(__pow)5', 'Exponentiation operator should use __pow metamethod, if provided [3]')




-- __sub

mt.__sub = function (a, b)
	return a.value..'(__sub)'..b.value
end

assertTrue (o - p == '3(__sub)5', 'Subtraction operator should use __sub metamethod, if provided [1]')
assertTrue (o - x == '3(__sub)moo', 'Subtraction operator should use __sub metamethod, if provided [2]')
assertTrue (x - p == 'moo(__sub)5', 'Subtraction operator should use __sub metamethod, if provided [3]')




-- __unm

mt.__unm = function (a)
	return '(__unm)'..a.value
end

assertTrue (-o == '(__unm)3', 'Negation operator should use __unm metamethod, if provided')








-- Relational metamethods


-- __eq
local x = 0

mt.__eq = function (a, b)
	x = x + 1
	return true
end

assertTrue (o == p, 'Equality operator should use __eq metamethod, if provided [1]')
assertTrue (x == 1, 'Equality operator should use __eq metamethod, if provided [2]')

assertTrue (not (o == 123), 'Equality operator should not use __eq metamethod if objects are of different type [1]')
assertTrue (x == 1, 'Equality operator should not use __eq metamethod if operands are of different type [2]')

assertTrue (o == o, 'Equality operator should not use __eq metamethod if the operands are the same object [1]')
assertTrue (x == 1, 'Equality operator should not use __eq metamethod if the operands are the same object [2]')




-- __le

x = 0

mt.__le = function (a, b)
	x = x + 1
	return a.value == 3
end

assertTrue (o <= p, 'Less than or equal to operator should use __le metamethod, if provided [1]')
assertTrue (x == 1, 'Less than or equal to operator should use __le metamethod, if provided [2]')
assertTrue (not (p <= o), 'Less than or equal to operator should use __le metamethod, if provided [3]')
assertTrue (x == 2, 'Less than or equal to operator should use __le metamethod, if provided [4]')




-- __lt

x = 0

mt.__lt = function (a, b)
	x = x + 1
	return a.value == 3
end

assertTrue (o < p, 'Less than operator should use __le metamethod, if provided [1]')
assertTrue (x == 1, 'Less than operator should use __le metamethod, if provided [2]')
assertTrue (not (p < o), 'Less than operator should use __le metamethod, if provided [3]')
assertTrue (x == 2, 'Less than operator should use __le metamethod, if provided [4]')



-- __call

x = ''
mt.__concat = nil

mt.__call = function (p1, p2)
	if p1 == o then 
		x = 'Ron ' 
	end
	
	x = x .. p2
	return 'CEO'
end

y = o('Dennis')

assertTrue (x == 'Ron Dennis', 'When executing a table, __call metamethod should be used, if provided')
assertTrue (y == 'CEO', 'When executing a table with a __call metamethod, the return value(s) of __call function should be returned')








-------------
-- LIBRARY --
-------------


-- MAIN FUNCTIONS


-- assert
local ass = function (test)
	return assert (test, 'error message')
end

a, b, c = pcall (ass, true)
assertTrue (a, 'Assert should not throw an error when passed true')
assertTrue (b, 'Assert should return the value passed in the first return value')
assertTrue (c == 'error message', 'Assert should return the message passed in the second return value')

a, b, c = pcall (ass, 0)
assertTrue (a, 'Assert should not throw an error when passed 0')

a, b, c = pcall (ass, 1)
assertTrue (a, 'Assert should not throw an error when passed 1')

a, b, c = pcall (ass, '')
assertTrue (a, 'Assert should not throw an error when passed an empty string')

a, b, c = pcall (ass, nil)
assertTrue (not a, 'Assert should throw an error when passed nil')
--assertTrue (b == 'error message', 'Assert should throw an error with the given message')

a, b, c = pcall (ass, false)
assertTrue (not a, 'Assert should throw an error when passed false')






-- getmetatable

local mt = {}
local t = {}
setmetatable(t, mt)

a = getmetatable(t)
b = getmetatable('moo')
c = getmetatable(123)
d = getmetatable({})
e = getmetatable(true)
f = getmetatable(function () end)
g = getmetatable('baa')

assertTrue (a == mt, 'getmetatable() should return a table\'s metatable if set')
assertTrue (type(b) == 'table', 'getmetatable() should return a metatable when passed a string')
assertTrue (b.__index == string, 'getmetatable() should return the string module as a prototype of string')
assertTrue (c == nil, 'getmetatable() should return nil when passed a number')
assertTrue (d == nil, 'getmetatable() should return nil when passed a table without a metatable')
assertTrue (e == nil, 'getmetatable() should return nil when passed a boolean')
assertTrue (f == nil, 'getmetatable() should return nil when passed a function')
assertTrue (g == b, 'The metatable of all strings should be the same table')






-- ipairs

local a = {2,4,8}
local b = ''

for i, v in ipairs(a) do
	b = b..'['..i..'='..v..']'
end

assertTrue (b == '[1=2][2=4][3=8]', 'ipairs() should iterate over table items [1]')


local t = {nil, 1, 2} 
local s = ''

for i, v in ipairs(t) do 
    s = s..tostring(i)..'='..tostring(v)..';'
end

assertTrue (s == '', 'ipairs() should not iterate over nil values in a table.')


t = {3, 4, nil, 1, 2} 
s = ''

for i, v in ipairs(t) do 
    s = s..tostring(i)..'='..tostring(v)..';'
end

assertTrue (s == '1=3;2=4;', 'ipairs() should iterate over values up to but not including nil values in a table.')


t = {
  [0] = "zero",
  [1] = "one",
  [2] = "two",
  [-1] = "negative",
  foo = "string",
  [0.5] = "half"
}

local r = {}

for i, v in ipairs(t) do 
    r[v] = true
end

assertTrue (not r.zero, 'ipairs() should not iterate over zero key')
assertTrue (r.one, 'ipairs() should iterate over positive integer keys [1]')
assertTrue (r.two, 'ipairs() should iterate over positive integer keys [2]')
assertTrue (not r.negative, 'ipairs() should not iterate over negative keys')
assertTrue (not r.string, 'ipairs() should not iterate over string keys')
assertTrue (not r.half, 'ipairs() should not iterate over non-integer numeric keys')




-- load

-- if (arg and arg[-1] == 'moonshine') then
-- 	src = '{"sourceName":"@test.lua","lineDefined":0,"lastLineDefined":0,"upvalueCount":0,"paramCount":0,"is_vararg":2,"maxStackSize":2,"instructions":[1,0,0,0,30,0,2,0,30,0,1,0],"constants":["hello"],"functions":[],"linePositions":[82,82,82],"locals":[],"upvalues":[],"sourcePath":"./test.lua"}'
-- else
-- 	src = 'return "hello"'
-- end

-- local index = 0
-- local function getChar ()
-- 	index = index + 1
-- 	return string.sub(src, index, index)
-- end

-- local f = load(getChar)
-- assertTrue (type(f) == 'function', 'load() should return a function when passed a valid source string')

-- local result = f();
-- assertTrue (result == 'hello', 'The function returned from load() should return the value from the script')




-- -- loadfile

-- local f = loadfile('scripts/not-a-file.luac')
-- assertTrue (f == nil, 'loadfile() should return nil when passed an invalid filename')


-- mainGlobal1 = 'mainGlbl'
-- mainGlobal2 = 'mainGlbl'

-- local mainLocal = 'mainLoc'

-- f = loadfile('lib-loadfile.lua')
-- assertTrue (type(f) == 'function', 'loadfile() should return a function when passed a valid filename')

-- local result = f();

-- assertTrue (type(result) == 'table', 'The function returned from loadfile() should return the value from the script')
-- assertTrue (type(result.getValue) == 'function', 'The function returned from loadfile() should return the value that is returned from the script[1]')
-- assertTrue (result.getValue() == 'moo', 'The function returned from loadfile() should return the value that is returned from the script[2]')

-- assertTrue (mainGlobal1 == 'innerGlbl', 'The function returned from loadfile() should share the same global namespace as the outer script[1]')
-- assertTrue (mainGlobal2 == 'mainGlbl', 'The function returned from loadfile() should share the same global namespace as the outer script[2]')
-- assertTrue (innerLocal == nil, 'Function locals should not leak into outer environment in a loadfile() function call')




-- -- loadstring

-- local f = loadstring(src)
-- assertTrue (type(f) == 'function', 'loadstring() should return a function when passed a valid source string')

-- local result = f()
-- assertTrue (result == 'hello', 'The function returned from loadstring() should return the value from the script')

-- local s = string.dump(function () return 'bar' end)
-- f = loadstring(s)
-- result = f()

-- assertTrue (result == 'bar', 'loadstring() should be able to create a function from the output of string.dump()')



-- pairs

local a, b = "", {foo=1}
b["bar"] = "Hello",
table.insert(b, 123)

for i, v in pairs(b) do
	a = a..i..':'..v..';'
end

assertTrue (#a == #'1:123;bar:Hello;foo:1;', 'pairs() should iterate over table items [2]')	-- Have to compare lengths because order is arbitrary


local t = {
  [0] = "zero",
  [1] = "one",
  [-1] = "negative",
  foo = "string",
  [0.5] = "half"
}
local r = {}

for i, v in pairs(t) do 
    r[v] = true
end

assertTrue (r.zero, 'pairs() should iterate over zero key')
assertTrue (r.one, 'pairs() should iterate over positive integer keys')
assertTrue (r.negative, 'pairs() should iterate over negative keys')
assertTrue (r.string, 'pairs() should iterate over string keys')
assertTrue (r.half, 'pairs() should iterate over non-integer numberic keys')


t = { nil, nil, 123 }
a = ''

for i, v in pairs(t) do
	a = a..i..':'..v..';'
end

assertTrue (a == '3:123;', 'pairs() should iterate over numeric table items')


t = {}
t[10] = {}
t[15] = {}
s = ''

for i in pairs(t) do
	s = s..i..';'
end

assertTrue (s == '10;15;', 'pairs() should return correct numeric keys')




-- pcall

function goodfunc (x) 
	return x + 1, x + 2
end 

function badfunc ()
	error ('I\'m bad.')
end 

a, b, c = pcall (goodfunc, 6)

assertTrue (a == true, 'pcall() should return true in the first item when a function executes successfully')
assertTrue (b == 7, 'pcall() should return the result of the function in the items following the first item returned, when a function executes successfully [1]')
assertTrue (c == 8, 'pcall() should return the result of the function in the items following the first item returned, when a function executes successfully [2]')


a, b, c = pcall (badfunc, 6)

assertTrue (a == false, 'pcall() should return false in the first item when the function errors during execution')
assertTrue (not (b == nil), 'pcall() should return an error message in the second item when the function error during execution')
assertTrue (c == nil, 'pcall() should only return 2 items when the function error during execution')





-- rawequal
-- rawget
-- rawset

-- TODO




-- require
	
-- mainGlobal1 = 'mainGlbl'
-- mainGlobal2 = 'mainGlbl'

-- local mainLocal = 'mainLoc'

-- local result = require 'lib-require'

-- assertTrue (type(result) == 'table', 'require() should return a table')
-- assertTrue (type(result.getValue) == 'function', 'require() should return the value that is returned from the module[1]')
-- assertTrue (result.getValue() == 'modVal', 'require() should return the value that is returned from the module[2]')

-- assertTrue (package.loaded['lib-require'] == result, 'Module loaded by require() should also be available in package.loaded[modname]')

-- assertTrue (mainGlobal1 == 'innerGlbl', 'require() should pass the same global namespace into the module[1]')
-- assertTrue (mainGlobal2 == 'mainGlbl', 'require() should pass the same global namespace into the module[2]')
-- assertTrue (innerLocal == nil, 'Module locals should not leak into outer environment in a require() call')






-- select

local a, b, c, d = select (3, 2, 4, 6, 8, 10)

assertTrue (a == 6, 'select() should return its own arguments from the (n + 1)th index, where n is the value of the first argument [1]')
assertTrue (b == 8, 'select() should return its own arguments from the (n + 1)th index, where n is the value of the first argument [2]')
assertTrue (c == 10, 'select() should return its own arguments from the (n + 1)th index, where n is the value of the first argument [3]')
assertTrue (d == nil, 'select() should return its own arguments from the (n + 1)th index, where n is the value of the first argument [4]')


local a, b = select ('#', 2, 4, 6, 8, 10)

assertTrue (a == 5, 'select() should return the total number of arguments - 1, when the first argument is "#" [1]')
assertTrue (b == nil, 'select() should return the total number of arguments - 1, when the first argument is "#" [2]')


local f = function ()
	local x, y = select ('moo', 2, 4, 6, 8, 10)
end

local a, b = pcall (f)

assertTrue (a == false, 'select() should error if the first argument is not a number or a string with the value of "#"')




-- setmetatable
-- TODO




-- tonumber

local a = tonumber ('1234')
local b = tonumber ('1234 ')
local c = tonumber (' 1234 ')
local d = tonumber ('1234abc')
local e = tonumber ('1234 12')
local f = tonumber ('1.234')
local g = tonumber ('1.234e+5')
local h = tonumber ('1.234e-5')

assertTrue (a == 1234, 'tonumber() should convert basic numeric strings to decimal and default to base 10')
assertTrue (b == 1234, 'tonumber() should convert numeric strings suffixed with spaces [1]')
assertTrue (c == 1234, 'tonumber() should convert numeric strings prefixed with spaces [1]')
assertTrue (d == nil, 'tonumber() should not convert strings containing letters [1]')
assertTrue (e == nil, 'tonumber() should not convert numeric strings containing spaces in the middle [1]')
assertTrue (f == 1.234, 'tonumber() should convert numeric strings of floating point numbers at base 10 [1]')
assertTrue (g == 123400, 'tonumber() should convert numeric strings of exponential (+ve) numbers at base 10 [1]')
assertTrue (h == 0.00001234, 'tonumber() should convert numeric strings of exponential (-ve) numbers at base 10 [1]')


local a = tonumber ('1234', 10)
local b = tonumber ('1234 ', 10)
local c = tonumber (' 1234 ', 10)
local d = tonumber ('1234abc', 10)
local e = tonumber ('1234 12', 10)
local f = tonumber ('1.234', 10)
local g = tonumber ('1.234e+5', 10)
local h = tonumber ('1.234e-5', 10)

assertTrue (a == 1234, 'tonumber() should convert basic numeric strings to decimal with base 10')
assertTrue (b == 1234, 'tonumber() should convert numeric strings suffixed with spaces [2]')
assertTrue (c == 1234, 'tonumber() should convert numeric strings prefixed with spaces [2]')
assertTrue (d == nil, 'tonumber() should not convert strings containing letters [2]')
assertTrue (e == nil, 'tonumber() should not convert numeric strings containing spaces in the middle [2]')
assertTrue (f == 1.234, 'tonumber() should convert numeric strings of floating point numbers at base 10 [2]')
assertTrue (g == 123400, 'tonumber() should convert numeric strings of exponential (+ve) numbers at base 10 [2]')
assertTrue (h == 0.00001234, 'tonumber() should convert numeric strings of exponential (-ve) numbers at base 10 [2]')


local a = tonumber ('101', 2)
local b = tonumber ('101 ', 2)
local c = tonumber (' 101 ', 2)
local d = tonumber ('101abc', 2)
local e = tonumber ('101 10', 2)
local f = tonumber ('101.10', 2)
local g = tonumber ('1.01e+10', 2)

assertTrue (a == 5, 'tonumber() should convert basic numeric strings to decimal with base 2')
assertTrue (b == 5, 'tonumber() should convert numeric strings suffixed with spaces with base 2')
assertTrue (c == 5, 'tonumber() should convert numeric strings prefixed with spaces with base 2')
assertTrue (d == nil, 'tonumber() should not convert strings containing letters with base 2')
assertTrue (e == nil, 'tonumber() should not convert numeric strings containing spaces in the middle with base 2')
assertTrue (f == nil, 'tonumber() should not convert numeric strings of floating point numbers at base 2')
assertTrue (g == nil, 'tonumber() should not convert numeric strings of exponential numbers at base 2')


local a = tonumber ('123', 16)
local b = tonumber ('1AF', 16)
local c = tonumber ('1AF ', 16)
local d = tonumber (' 1AF ', 16)
local e = tonumber ('123Axyz', 16)
local f = tonumber ('123 45', 16)
local g = tonumber ('123.4', 16)
local h = tonumber ('1.23e+10', 16)

assertTrue (a == 291, 'tonumber() should convert basic numeric strings to decimal with base 16')
assertTrue (b == 431, 'tonumber() should convert hexadecimal strings to decimal with base 16')
assertTrue (c == 431, 'tonumber() should convert hexadecimal strings suffixed with spaces with base 16')
assertTrue (d == 431, 'tonumber() should convert hexadecimal strings prefixed with spaces with base 16')
assertTrue (e == nil, 'tonumber() should not convert strings containing letters out of the range of hexadecimal, with base 16')
assertTrue (f == nil, 'tonumber() should not convert hexadecimal strings containing spaces in the middle with base 16')
assertTrue (g == nil, 'tonumber() should not convert hexadecimal strings of floating point numbers at base 16')
assertTrue (h == nil, 'tonumber() should not convert hexadecimal strings of exponential numbers at base 16')


local a = tonumber ('')
local b = tonumber ('', 2)
local c = tonumber ('', 10)
local d = tonumber ('', 16)
assertTrue (a == nil, 'tonumber() should return nil with passed an empty string')
assertTrue (b == nil, 'tonumber() should return nil with passed an empty string with base 2')
assertTrue (c == nil, 'tonumber() should return nil with passed an empty string with base 10')
assertTrue (d == nil, 'tonumber() should return nil with passed an empty string with base 16')

local a = tonumber (nil)
local b = tonumber (0/0)
local c = tonumber (math.huge)
local d = tonumber (-math.huge)
assertTrue (a == nil, 'tonumber() should return nil when passed nil')
assertTrue (b ~= b, 'tonumber() should return nan when passed nan')
assertTrue (c == math.huge, 'tonumber() should return a number when passed inf')
assertTrue (d == -math.huge, 'tonumber() should return a number when passed -inf')

local a = tonumber (123)
local b = tonumber (-123)
local c = tonumber (0)
local d = tonumber { value = 123 }
local e = tonumber (function () return 123 end)

assertTrue (a == 123, 'tonumber() should return a number when passed a number')
assertTrue (b == -123, 'tonumber() should return a negative number when passed a negative number')
assertTrue (c == 0, 'tonumber() should return a zero when passed a zero')
assertTrue (d == nil, 'tonumber() should return nil when passed a table')
assertTrue (e == nil, 'tonumber() should return nil when passed a function')

local a = tonumber ('0xa.2')
local b = tonumber ('0xa.2', 10)
local c = tonumber ('0xa.2', 16)
local d = tonumber ('0xa', 10)
local e = tonumber ('0xa', 16)
local f = tonumber ('0xa', 12)

assertTrue (a == 10.125, 'tonumber() should coerce string when using base 10 [1]')
assertTrue (b == 10.125, 'tonumber() should coerce string when using base 10 [2]')
assertTrue (c == nil, 'tonumber() should return nil when string is invalid [1]')
assertTrue (d == 10, 'tonumber() should coerce string when using base 10 [3]')
assertTrue (e == 10, 'tonumber() should ignore leading "0x" when converting to base 16.')
assertTrue (f == nil, 'tonumber() should return nil when string is invalid [2]')

local a = tonumber (10, 16)
local b = tonumber (0xa, 16)
local c = tonumber ('0xa', 34)
local d = tonumber ('inf')
local e = tonumber ('inf', 16)
local f = tonumber (math.huge, 16)

assertTrue (a == 16, 'tonumber() should coerce first argument to a string [1]')
assertTrue (b == 16, 'tonumber() should coerce first argument to a string [2]')
assertTrue (c == 1132, 'tonumber() should convert "x" correctly for bases greater than 33')
assertTrue (d == math.huge, 'tonumber() should coerce "inf" to inf with base 10')
assertTrue (e == nil, 'tonumber() should coerce "inf" to nil with bases other than 10')
assertTrue (f == nil, 'tonumber() should return nil when passed inf with bases other than 10')

local a = tonumber (0/0, 16)

assertTrue (a == nil, 'tonumber() should return nil when passed inf for bases other than 10')



-- tostring
-- TODO Check for use of __tostring metamethod

a = tostring (123)
b = tostring ({})
c = tostring ({1, 2, 3})
d = tostring (function () return true end)
e = tostring(math.huge)
f = tostring(-math.huge)
g = tostring(0/0)
h = tostring(true)
 
assertTrue (a == '123', 'tostring() should convert a number to a string')
assertTrue (string.sub(b, 1, 9) == 'table: 0x', 'tostring() should convert an empty table to a string')
assertTrue (string.sub(c, 1, 9) == 'table: 0x', 'tostring() should convert a table to a string')
assertTrue (string.sub(d, 1, 12) == 'function: 0x', 'tostring() should convert a function to a string')
assertTrue (e == 'inf', 'tostring() should convert infinity to "inf"')
assertTrue (f == '-inf', 'tostring() should convert negative infinity to "-inf"')
assertTrue (g == 'nan', 'tostring() should convert not-a-number to "nan"')
assertTrue (h == 'true', 'tostring() should convert a boolean to a string')

a = {}
setmetatable(a, { __tostring = function () return 'Les Revenants' end })
b = tostring (a)

assertTrue (b == 'Les Revenants', 'tostring() should use __tostring function, if available on metatable')





-- type

local a = type (nil)
local b = type (123)
local c = type ('abc')
local d = type (true)
local e = type ({})
local f = type (function () return true end)

assertTrue (a == 'nil', 'type() should return "nil" for a variable with value of nil')
assertTrue (b == 'number', 'type() should return "number" for a variable with value of number')
assertTrue (c == 'string', 'type() should return "string" for a variable with value of type string')
assertTrue (d == 'boolean', 'type() should return "boolean" for a variable with value of type boolean')
assertTrue (e == 'table', 'type() should return "table" for a variable with value of type table')
assertTrue (f == 'function', 'type() should return "function" for a variable with value of type function')



-- unpack
do
	local a = {0, 1, 2, 4, 20, 50, 122}
	
	local b, c, d, e, f, g = unpack (a, 3);
	local h, i = unpack (a, 3, 2);
	local j, k, l, m = unpack (a, 3, 5);
	
	assertTrue (b == 2, 'unpack() should return the correct items of the given list [1]')
	assertTrue (c == 4, 'unpack() should return the correct items of the given list [2]')
	assertTrue (d == 20, 'unpack() should return the correct items of the given list [3]')
	assertTrue (e == 50, 'unpack() should return the correct items of the given list [4]')
	assertTrue (f == 122, 'unpack() should return the correct items of the given list [5]')
	assertTrue (g == nil, 'unpack() should return the correct items of the given list [6]')
	assertTrue (h == nil, 'unpack() should return the correct items of the given list [7]')
	assertTrue (i == nil, 'unpack() should return the correct items of the given list [8]')
	assertTrue (j == 2, 'unpack() should return the correct items of the given list [9]')
	assertTrue (k == 4, 'unpack() should return the correct items of the given list [10]')
	assertTrue (l == 20, 'unpack() should return the correct items of the given list [11]')
	assertTrue (m == nil, 'unpack() should return the correct items of the given list [12]')
	
	
	local a = {nil, nil, 180}
	local b, c, d, e = unpack (a);
	assertTrue (b == nil, 'unpack() should return the correct items of the given list [13]')
	assertTrue (c == nil, 'unpack() should return the correct items of the given list [14]')
	assertTrue (d == 180, 'unpack() should return the correct items of the given list [15]')
	assertTrue (e == nil, 'unpack() should return the correct items of the given list [16]')
	
	
	--Make sure binary searching is implemented the same way as C…
	local table1 = {true, nil, true, false, nil, true, nil}
	local table2 = {true, false, nil, false, nil, true, nil}
	local table3 = {true, false, false, false, true, true, nil}
	
	local a1, b1, c1, d1, e1, f1 = unpack (table1);
	local a2, b2, c2, d2, e2, f2 = unpack (table2);
	local a3, b3, c3, d3, e3, f3, g3 = unpack (table3);
	
	
	assertTrue (a1, 'unpack() should return the same items as the C implementation [1]')
	assertTrue (b1 == nil, 'unpack() should return the same items as the C implementation [2]')
	assertTrue (c1, 'unpack() should return the same items as the C implementation [3]')
	assertTrue (not d1, 'unpack() should return the same items as the C implementation [4]')
	assertTrue (e1 == nil, 'unpack() should return the same items as the C implementation [5]')
	assertTrue (f1 == nil, 'unpack() should return the same items as the C implementation [6]')
	assertTrue (a2, 'unpack() should return the same items as the C implementation [7]')
	assertTrue (not b2, 'unpack() should return the same items as the C implementation [8]')
	assertTrue (c2 == nil, 'unpack() should return the same items as the C implementation [9]')
	assertTrue (d2 == nil, 'unpack() should return the same items as the C implementation [10]')
	assertTrue (e2 == nil, 'unpack() should return the same items as the C implementation [11]')
	assertTrue (f2 == nil, 'unpack() should return the same items as the C implementation [12]')
	
	assertTrue (a3, 'unpack() should return the same items as the C implementation [13]')
	assertTrue (not b3, 'unpack() should return the same items as the C implementation [14]')
	assertTrue (not c3, 'unpack() should return the same items as the C implementation [15]')
	assertTrue (not d3, 'unpack() should return the same items as the C implementation [16]')
	assertTrue (e3, 'unpack() should return the same items as the C implementation [17]')
	assertTrue (f3, 'unpack() should return the same items as the C implementation [18]')
	assertTrue (g3 == nil, 'unpack() should return the same items as the C implementation [19]')
end



-- _VERSION

assertTrue (_VERSION == 'Lua 5.1', '_VERSION should be "Lua 5.1"')




-- xpcall

function goodfunc ()
	return 10, "win"
end

function badfunc ()
	error ('I\'m bad.')
end 

function errfunc ()
	return 999, "fail"
end 

a, b, c, d = xpcall (goodfunc, errfunc)

assertTrue (a == true, 'xpcall() should return true in the first item when a function executes successfully')
assertTrue (b == 10, 'xpcall() should return the result of the function in the items following the first item returned, when a function executes successfully [1]')
assertTrue (c == 'win', 'xpcall() should return the result of the function in the items following the first item returned, when a function executes successfully [2]')
assertTrue (d == nil, 'xpcall() should return the result of the function in the items following the first item returned, when a function executes successfully [3]')

a, b, c = xpcall (badfunc, errfunc)

assertTrue (a == false, 'xpcall() should return false in the first item when the function errors during execution')
assertTrue (b == 999, 'xpcall() should return the first item of the result of the error function in the second item returned, when the function errors during execution')
assertTrue (c == nil, 'xpcall() should only return the first item of the result of the error function in the items following the first item returned, when the function errors during execution')








-- STRING FUNCTIONS


-- byte

local a, b = string.byte ('Mo0')

assertTrue (a == 77, 'string.byte() should return the numerical code for the first character in the first returned item')
assertTrue (b == nil, 'string.byte() should return only one item when only no length is given [1]')


local a, b = string.byte ('Mo0', 2)

assertTrue (a == 111, 'string.byte() should return the numerical code for the nth character in the first returned item, when n is specified in the second argument [1]')
assertTrue (b == nil, 'string.byte() should return only one item when no length is given [2]')


local a, b, c = string.byte ('Mo0', 2, 3)

assertTrue (a == 111, 'string.byte() should return the numerical code for the nth character in the first returned item, when n is specified in the second argument [2]')
assertTrue (b == 48, 'string.byte() should return the numerical code for the nth character in the first returned item, when n is specified in the second argument [3]')
assertTrue (c == nil, 'string.byte() should return only the number of items specified in the length argument or the up to the end of the string, whichever is encountered first [1]')


local a, b, c = string.byte ('Mo0', 3, 20)

assertTrue (a == 48, 'string.byte() should return the numerical code for the nth character in the first returned item, when n is specified in the second argument [4]')
assertTrue (b == nil, 'string.byte() should return only the number of items specified in the length argument or the up to the end of the string, whichever is encountered first [2]')




-- char

local a = string.char ()
local b = string.char (116, 101, 115, 116, 105, 99, 108, 101, 115)

assertTrue (a == '', 'string.byte() should return an empty string when called with no arguments')
assertTrue (b == 'testicles', 'string.byte() should return a string comprising of characters representing by the value each of the arguments passed')




-- find

local a = 'The quick brown fox'

local b = string.find (a, 'quick');
local c = string.find (a, 'fox');
local d = string.find (a, 'kipper');
local e = string.find (a, '');

local f = string.find (a, 'quick', 8);
local g = string.find (a, 'fox', 8);

assertTrue (b == 5, 'string.find() should return the location of the first occurrence of the second argument within the first, if it is present [1]')
assertTrue (c == 17, 'string.find() should return the location of the first occurrence of the second argument within the first, if it is present [2]')
assertTrue (d == nil, 'string.find() should return nil if the second argument is not contained within the first [1]')
assertTrue (e == 1, 'string.find() should return return 1 if the second argument is an empty string')
assertTrue (f == nil, 'string.find() should return nil if the second argument is not contained within the first after the index specified by the third argument')
assertTrue (g == 17, 'string.find() should return the location of the second argument if it is contained within the first after the index specified by the third argument')

local b, c, d, e = string.find (a, 'q(.)(.)');
assertEqual (b, 5, 'string.find() should return the location of the first occurrence of the second argument within the first, if it is present [3]')
assertEqual (c, 7, 'string.find() should return the location of the last character of the first occurrence of the second argument within the first, if it is present')
assertEqual (d, 'u', 'string.find() should return the groups that are specified in the regex. [1]')
assertEqual (e, 'i', 'string.find() should return the groups that are specified in the regex. [2]')

b = string.find('[', '[_%w]')
assertTrue (b == nil, 'string.find() should not return the location of special syntax [ and ].')





-- -- format

-- do
-- 	local a = string.format("%s %q", "Hello", "Lua user!")
-- 	local b = string.format("%c%c%c", 76,117,97)            -- char
-- 	local c = string.format("%e, %E", math.pi,math.pi)      -- exponent
-- 	local d1 = string.format("%f", math.pi)					-- float 
-- 	local d2 = string.format("%g", math.pi)					-- compact float

-- -- issues:
-- 	local e = string.format("%d, %i, %u", -100,-100,-100)    -- signed, signed, unsigned integer	
-- 	local f = string.format("%o, %x, %X", -100,-100,-100)    -- octal, hex, hex

-- 	local g = string.format("%%s", 100)

-- 	assertTrue (a == 'Hello "Lua user!"', 'string.format() should format %s and %q correctly')
-- 	assertTrue (b == 'Lua', 'string.format() should format %c correctly')
-- 	assertTrue (d1 == '3.141593', 'string.format() should format %f correctly')
-- 	-- assertTrue (e == '-100, -100, 4294967196', 'string.format() should format %d, %i and %u correctly')
-- 	-- assertTrue (f == '37777777634, ffffff9c, FFFFFF9C', 'string.format() should format %o, %x and %X correctly')
-- 	-- assertTrue (e == '-100, -100, 18446744073709551516', 'string.format() should format %d, %i and %u correctly')
-- 	-- assertTrue (f == '1777777777777777777634, ffffffffffffff9c, FFFFFFFFFFFFFF9C', 'string.format() should format %o, %x and %X correctly')
-- 	assertTrue (g == '%s', 'string.format() should format %% correctly')

-- -- TODO!!!
-- --	assertTrue (c == '3.141593e+00, 3.141593E+00', 'string.format() should format %e and %E correctly')
-- --	assertTrue (d2 == '3.14159', 'string.format() should format %g correctly')


-- 	a = function () string.format("%*", 100) end
-- 	b = function () string.format("%l", 100) end
-- 	c = function () string.format("%L", 100) end
-- 	d = function () string.format("%n", 100) end
-- 	e = function () string.format("%p", 100) end
-- 	f = function () string.format("%h", 100) end

-- 	assertTrue (not pcall(a), 'string.format() should error when passed %*')
-- 	assertTrue (not pcall(b), 'string.format() should error when passed %l')
-- 	assertTrue (not pcall(c), 'string.format() should error when passed %L')
-- 	assertTrue (not pcall(d), 'string.format() should error when passed %n')
-- 	assertTrue (not pcall(e), 'string.format() should error when passed %p')
-- 	assertTrue (not pcall(f), 'string.format() should error when passed %h')


-- 	a = string.format("%.3f", 5.1)
-- 	b = "Lua version " .. string.format("%.1f", 5.1)
-- 	c = string.format("pi = %.4f", math.pi)
-- 	f = string.format("%.3f", 5)

--     local d, m, y = 5, 11, 1990
--     e = string.format("%02d/%02d/%04d", d, m, y)


-- 	assertTrue (a == '5.100', 'string.format() should format floating point numbers correctly[1]')
-- 	assertTrue (b == 'Lua version 5.1', 'string.format() should format floating point numbers correctly[2]')
-- 	assertTrue (c == 'pi = 3.1416', 'string.format() should format floating point numbers correctly[3]')
-- 	assertTrue (e == '05/11/1990', 'string.format() should format decimals correctly [0]')
-- 	assertTrue (f == '5.000', 'string.format() should format floating point numbers correctly[4]')


-- 	a = function () string.format('%#####s', 'x') end
-- 	b = function () string.format('%######s', 'x') end

-- 	assertTrue (pcall(a), 'string.format() should handle five flags')
-- 	assertTrue (not pcall(b), 'string.format() should not handle six flags')


--     local tag, title = "h1", "a title"
--     a = string.format("<%s>%s</%s>", tag, title, tag)
--     b = string.format("%8s", "Lua")
--     c = string.format("%.8s", "Lua")
--     d = string.format("%.2s", "Lua")
--     e = string.format("%8.2s", "Lua")
--     f = string.format("%+8.2s", "Lua")
--     g = string.format("%-8.2s", "Lua")
--     local h = string.format("%08.2s", "Lua")
--     local i = string.format("%#8.2s", "Lua")
--     local j = string.format("% 8.2s", "Lua")
--     local k = string.format("%+-0# 8.2s", "Lua")
--     local l = string.format("%0.2s", "Lua")

-- 	assertTrue (a == '<h1>a title</h1>', 'string.format() should format strings correctly[1]')
-- 	assertTrue (b == '     Lua', 'string.format() should format strings correctly[2]')
-- 	assertTrue (c == 'Lua', 'string.format() should format strings correctly[3]')
-- 	assertTrue (d == 'Lu', 'string.format() should format strings correctly[4]')
-- 	assertTrue (e == '      Lu', 'string.format() should format strings correctly[5]')
-- 	assertTrue (f == '      Lu', 'string.format() should format strings correctly[6]')
-- 	assertTrue (g == 'Lu      ', 'string.format() should format strings correctly[7]')
-- 	assertTrue (h == '000000Lu', 'string.format() should format strings correctly[8]')
-- 	assertTrue (i == '      Lu', 'string.format() should format strings correctly[9]')
-- 	assertTrue (j == '      Lu', 'string.format() should format strings correctly[10]')
-- 	assertTrue (k == 'Lu      ', 'string.format() should format strings correctly[11]')
-- 	assertTrue (l == 'Lu', 'string.format() should format strings correctly[12]')


--     a = string.format("%8d", 123.45)
--     b = string.format("%.8d", 123.45)
--     c = string.format("%.2d", 123.45)
--     d = string.format("%8.2d", 123.45)
--     e = string.format("%+8.2d", 123.45)
--     f = string.format("%-8.2d", 123.45)
--     g = string.format("%08.2d", 123.45)
--     h = string.format("%#8.2d", 123.45)
--     i = string.format("% 8.2d", 123.45)
--     j = string.format("%+-0# 8.2d", 123.45)
--     k = string.format("%0.2d", 123.45)
--     l = string.format("%+.8d", 123.45)
--     local m = string.format("%-.8d", 123.45)
--     local n = string.format("%#.8d", 123.45)
--     local o = string.format("%0.8d", 123.45)
--     local p = string.format("% .8d", 123.45)
--     local q = string.format("%+-#0 .8d", 123.45)
--     local r = string.format("%8.5d", 123.45)
--     local s = string.format("%+8.5d", 123.45)
--     local t = string.format("%-8.5d", 123.45)
-- 	local u = string.format("%-+8.5d", 123.45)
-- 	local v = string.format("%5d", 12.3e10)
-- 	local w = string.format("%.d", 123.45)

-- 	assertTrue (a == '     123', 'string.format() should format decimals correctly[1]')
-- 	assertTrue (b == '00000123', 'string.format() should format decimals correctly[2]')
-- 	assertTrue (c == '123', 'string.format() should format decimals correctly[3]')
-- 	assertTrue (d == '     123', 'string.format() should format decimals correctly[4]')
-- 	assertTrue (e == '    +123', 'string.format() should format decimals correctly[5]')
-- 	assertTrue (f == '123     ', 'string.format() should format decimals correctly[6]')
-- 	assertTrue (g == '     123', 'string.format() should format decimals correctly[7]')
-- 	assertTrue (h == '     123', 'string.format() should format decimals correctly[8]')
-- 	assertTrue (i == '     123', 'string.format() should format decimals correctly[9]')
-- 	assertTrue (j == '+123    ', 'string.format() should format decimals correctly[10]')
-- 	assertTrue (k == '123', 'string.format() should format decimals correctly[11]')
-- 	assertTrue (l == '+00000123', 'string.format() should format decimals correctly[12]')
-- 	assertTrue (m == '00000123', 'string.format() should format decimals correctly[13]')
-- 	assertTrue (n == '00000123', 'string.format() should format decimals correctly[14]')
-- 	assertTrue (o == '00000123', 'string.format() should format decimals correctly[15]')
-- 	assertTrue (p == ' 00000123', 'string.format() should format decimals correctly[16]')
-- 	assertTrue (q == '+00000123', 'string.format() should format decimals correctly[17]')
-- 	assertTrue (r == '   00123', 'string.format() should format decimals correctly[18]')
-- 	assertTrue (s == '  +00123', 'string.format() should format decimals correctly[19]')
-- 	assertTrue (t == '00123   ', 'string.format() should format decimals correctly[20]')
-- 	assertTrue (u == '+00123  ', 'string.format() should format decimals correctly[21]')
-- 	assertTrue (v == '123000000000', 'string.format() should format decimals correctly[22]')
-- 	assertTrue (w == '123', 'string.format() should format decimals correctly[23]')
	
--     a = string.format("%8d", -123.45)
--     b = string.format("%.8d", -123.45)
--     c = string.format("%.2d", -123.45)
--     d = string.format("%8.2d", -123.45)
--     e = string.format("%+8.2d", -123.45)
--     f = string.format("%-8.2d", -123.45)
--     g = string.format("%08.2d", -123.45)
--     h = string.format("%#8.2d", -123.45)
--     i = string.format("% 8.2d", -123.45)
--     j = string.format("%+-0# 8.2d", -123.45)
--     k = string.format("%0.2d", -123.45)
--     l = string.format("%+.8d", -123.45)
--     m = string.format("%-.8d", -123.45)
--     n = string.format("%#.8d", -123.45)
--     o = string.format("%0.8d", -123.45)
--     p = string.format("% .8d", -123.45)
--     q = string.format("%+-#0 .8d", -123.45)
--     r = string.format("%8.5d", -123.45)
--     s = string.format("%+8.5d", -123.45)
--     t = string.format("%-8.5d", -123.45)
-- 	u = string.format("%-+8.5d", -123.45)
-- 	v = string.format("%5d", -12.3e10)
-- 	w = string.format("%.d", -123.45)


-- 	assertTrue (a == '    -123', 'string.format() should format decimals correctly[31]')
-- 	assertTrue (b == '-00000123', 'string.format() should format decimals correctly[32]')
-- 	assertTrue (c == '-123', 'string.format() should format decimals correctly[33]')
-- 	assertTrue (d == '    -123', 'string.format() should format decimals correctly[34]')
-- 	assertTrue (e == '    -123', 'string.format() should format decimals correctly[35]')
-- 	assertTrue (f == '-123    ', 'string.format() should format decimals correctly[36]')
-- 	assertTrue (g == '    -123', 'string.format() should format decimals correctly[37]')
-- 	assertTrue (h == '    -123', 'string.format() should format decimals correctly[38]')
-- 	assertTrue (i == '    -123', 'string.format() should format decimals correctly[39]')
-- 	assertTrue (j == '-123    ', 'string.format() should format decimals correctly[40]')
-- 	assertTrue (k == '-123', 'string.format() should format decimals correctly[41]')
-- 	assertTrue (l == '-00000123', 'string.format() should format decimals correctly[42]')
-- 	assertTrue (m == '-00000123', 'string.format() should format decimals correctly[43]')
-- 	assertTrue (n == '-00000123', 'string.format() should format decimals correctly[44]')
-- 	assertTrue (o == '-00000123', 'string.format() should format decimals correctly[45]')
-- 	assertTrue (p == '-00000123', 'string.format() should format decimals correctly[46]')
-- 	assertTrue (q == '-00000123', 'string.format() should format decimals correctly[47]')
-- 	assertTrue (r == '  -00123', 'string.format() should format decimals correctly[48]')
-- 	assertTrue (s == '  -00123', 'string.format() should format decimals correctly[49]')
-- 	assertTrue (t == '-00123  ', 'string.format() should format decimals correctly[50]')
-- 	assertTrue (u == '-00123  ', 'string.format() should format decimals correctly[51]')
-- 	assertTrue (v == '-123000000000', 'string.format() should format decimals correctly[52]')
-- 	assertTrue (w == '-123', 'string.format() should format decimals correctly[53]')


-- 	a = string.format("%+05.d", 123.45)
-- 	b = string.format("%05d", 123.45)
-- 	c = string.format("%05d", -123.45)
-- 	d = string.format("%+05d", 123.45)

-- 	assertTrue (a == ' +123', 'string.format() should format decimals correctly[60]')
-- 	assertTrue (b == '00123', 'string.format() should format decimals correctly[61]')
-- 	assertTrue (c == '-0123', 'string.format() should format decimals correctly[62]')
-- 	assertTrue (d == '+0123', 'string.format() should format decimals correctly[63]')



--     a = string.format("%8f", 123.45)
--     b = string.format("%.8f", 123.45)
--     c = string.format("%.1f", 123.45)
--     d = string.format("%8.2f", 123.45)
--     e = string.format("%+8.2f", 123.45)
--     f = string.format("%-8.3f", 123.45)
--     g = string.format("%08.3f", 123.45)
--     h = string.format("%#8.3f", 123.45)
--     i = string.format("% 8.3f", 123.45)
--     j = string.format("%+-0# 8.2f", 123.45)
--     k = string.format("%0.2f", 123.45)
--     l = string.format("%+.8f", 123.45)
--     m = string.format("%-.8f", 123.45)
--     n = string.format("%#.8f", 123.45)
--     o = string.format("%9.3f", 123.45)
--     p = string.format("%+9.3f", 123.45)
--     q = string.format("%-9.3f", 123.45)
-- 	r = string.format("%-+9.3f", 123.45)
-- 	s = string.format("%.0f", 123.45)
-- 	t = string.format("%.4f", 123.05)

-- 	assertTrue (a == '123.450000', 'string.format() should format floats correctly[1]')
-- 	assertTrue (b == '123.45000000', 'string.format() should format floats correctly[2]')
-- 	assertTrue (c == '123.5', 'string.format() should format floats correctly[3]')
-- 	assertTrue (d == '  123.45', 'string.format() should format floats correctly[4]')
-- 	assertTrue (e == ' +123.45', 'string.format() should format floats correctly[5]')
-- 	assertTrue (f == '123.450 ', 'string.format() should format floats correctly[6]')
-- 	assertTrue (g == '0123.450', 'string.format() should format floats correctly[7]')
-- 	assertTrue (h == ' 123.450', 'string.format() should format floats correctly[8]')
-- 	assertTrue (i == ' 123.450', 'string.format() should format floats correctly[9]')
-- 	assertTrue (j == '+123.45 ', 'string.format() should format floats correctly[10]')
-- 	assertTrue (k == '123.45', 'string.format() should format floats correctly[11]')
-- 	assertTrue (l == '+123.45000000', 'string.format() should format floats correctly[12]')
-- 	assertTrue (m == '123.45000000', 'string.format() should format floats correctly[13]')
-- 	assertTrue (n == '123.45000000', 'string.format() should format floats correctly[14]')
-- 	assertTrue (o == '  123.450', 'string.format() should format floats correctly[15]')
-- 	assertTrue (p == ' +123.450', 'string.format() should format floats correctly[16]')
-- 	assertTrue (q == '123.450  ', 'string.format() should format floats correctly[17]')
-- 	assertTrue (r == '+123.450 ', 'string.format() should format floats correctly[18]')
-- 	assertTrue (s == '123', 'string.format() should format floats correctly[19]')
-- 	assertTrue (t == '123.0500', 'string.format() should format floats correctly[20]')


-- 	a = string.format("%x", 123)
-- 	b = string.format("%x", 123.45)
-- 	c = string.format("%x", -123)
-- 	d = string.format("%4x", 123)
-- 	e = string.format("%.4x", 123)
-- 	f = string.format("%8.4x", 123)
-- 	g = string.format("%+8.4x", 123)
-- 	h = string.format("%-8.4x", 123)
-- 	i = string.format("%#8.4x", 123)
-- 	j = string.format("%08.4x", 123)
-- 	k = string.format("% 8.4x", 123)
-- 	l = string.format("%+-#0 8.4x", 123)
-- 	m = string.format("%08x", 123)
-- 	n = string.format("% x", 123)
	
-- 	assertTrue (a == '7b', 'string.format() should format hex correctly[1]')
-- 	assertTrue (b == '7b', 'string.format() should format hex correctly[2]')
-- 	assertTrue (c == 'ffffffffffffff85', 'string.format() should format hex correctly[3]')
-- 	assertTrue (d == '  7b', 'string.format() should format hex correctly[4]')
-- 	assertTrue (e == '007b', 'string.format() should format hex correctly[5]')
-- 	assertTrue (f == '    007b', 'string.format() should format hex correctly[6]')
-- 	assertTrue (g == '    007b', 'string.format() should format hex correctly[7]')
-- 	assertTrue (h == '007b    ', 'string.format() should format hex correctly[8]')
-- 	assertTrue (i == '  0x007b', 'string.format() should format hex correctly[9]')
-- 	assertTrue (k == '    007b', 'string.format() should format hex correctly[11]')
-- 	assertTrue (l == '0x007b  ', 'string.format() should format hex correctly[12]')
-- 	assertTrue (n == '7b', 'string.format() should format hex correctly[14]')


-- 	a = string.format("%8.2f\n", 1.234)
-- 	b = string.format("\n%8.2f", 1.234)
-- 	c = string.format("\n%8.2f\n", 1.234)

-- 	assertTrue (a == '    1.23\n', 'string.format() should correctly format patterns that contain new lines.[1]')
-- 	assertTrue (b == '\n    1.23', 'string.format() should correctly format patterns that contain new lines.[2]')
-- 	assertTrue (c == '\n    1.23\n', 'string.format() should correctly format patterns that contain new lines.[3]')


-- -- TODO!!!!
-- --	assertTrue (j == '    007b', 'string.format() should format hex correctly[10]')
-- --	assertTrue (m == '0000007b', 'string.format() should format hex correctly[13]')


-- -- print (c)

-- end




-- gmatch

local s = "from=world, to=Lua"
local x = string.gmatch(s, "(%w+)=(%w+)")

assertTrue (type(x) == 'function', 'string.gmatch() should return an iterator function')

local a, b, c = x()
assertTrue (a == 'from', 'string.gmatch() iterator should return the first group matched in the string [1]')
assertTrue (b == 'world', 'string.gmatch() iterator should return the second group matched in the string [1]')
assertTrue (c == nil, 'string.gmatch() iterator should return nil after all groups are matched [1]')

local a, b, c = x()
assertTrue (a == 'to', 'string.gmatch() iterator should return the first group matched in the string [2]')
assertTrue (b == 'Lua', 'string.gmatch() iterator should return the second group matched in the string [2]')
assertTrue (c == nil, 'string.gmatch() iterator should return nil after all groups are matched [2]')

local a = x()
assertTrue (a == nil, 'string.gmatch() iterator should return nil after all matches have ben returned')


local x = string.gmatch(s, "%w+=%w+")
local a, b = x()
assertTrue (a == 'from=world', 'string.gmatch() iterator should return the first match when no groups are specified')
assertTrue (b == nil, 'string.gmatch() iterator should return nil as second return value when no groups are specified [1]')

local a, b = x()
assertTrue (a == 'to=Lua', 'string.gmatch() iterator should return the second match when no groups are specified')
assertTrue (b == nil, 'string.gmatch() iterator should return nil as second return value when no groups are specified [2]')

do
	local x = string.gmatch(';a;', 'a*')
	local a, b, c, d, e, f = x(), x(), x(), x(), x(), x();

	assertEqual (a, '', 'string.gmatch() iterator should return correct values [1]')
	assertEqual (b, 'a', 'string.gmatch() iterator should return correct values [2]')
	assertEqual (c, '', 'string.gmatch() iterator should return correct values [3]')
	assertEqual (d, '', 'string.gmatch() iterator should return correct values [4]')
	assertEqual (e, nil, 'string.gmatch() iterator should return correct values [5]')
	assertEqual (e, nil, 'string.gmatch() iterator should return correct values [6]')
end




-- gsub

a = '<%?xml version="1.0" encoding="UTF%-8"%?>'
b = '<?xml version="1.0" encoding="UTF-8"?><my-xml></my-xml>'

c = string.gsub (b, a, 'moo')

assertTrue (c == 'moo<my-xml></my-xml>', 'string.gsub() should replace the matched part of the string[1]')
-- Not even scraping the surface

a = '%%1'
b = 'Hello %1'

c = string.gsub (b, a, 'world')
assertTrue (c == 'Hello world', 'string.gsub() should replace the matched part of the string[2]')


a = '%d'
b = 'ab5kfd8scf4lll'
c = function (x) return '('..x..')' end

d = string.gsub (b, a, c, 2)
assertTrue (d == 'ab(5)kfd(8)scf4lll', 'string.gsub() should replace the matched part of the string with the value returned from the given map function')


a = "[^:]+"
b = ":aa:bbb:cccc:ddddd:eee:"
c = function (subStr) end

d = string.gsub (b, a, c)
assertTrue (d == ':aa:bbb:cccc:ddddd:eee:', 'string.gsub() should not replace the matched part of the string if the value returned from the map function is nil')

c = function (subStr) return 'X' end

d = string.gsub (b, a, c)
assertTrue (d == ':X:X:X:X:X:', 'string.gsub() should replace the matched part of the string if the value returned from the map function is not nil')


c = string.gsub (';a;', 'a*', 'ITEM')
assertTrue (c == 'ITEM;ITEMITEM;ITEM', 'string.gsub() should replace the matched part of the string[2]')

    



-- len

local a = 'McLaren Mercedes'

local b = string.len ('');
local c = string.len (a);

assertTrue (b == 0, 'string.len() should return 0 if passed an empty string')
assertTrue (c == 16, 'string.len() should return the length of the string in the first argument')





-- lower

local a = 'McLaren Mercedes'

local b = string.lower ('');
local c = string.lower (a);

assertTrue (b == '', 'string.lower() should return an empty string if passed an empty string')
assertTrue (c == 'mclaren mercedes', 'string.lower() should return the string in the first argument with all character in lower case')




-- rep

local a = 'Ho'

local b = string.rep (a, 0);
local c = string.rep (a, 1);
local d = string.rep (a, 3);

assertTrue (b == '', 'string.rep() should return an empty string if the second argument is 0')
assertTrue (c == 'Ho', 'string.rep() should return the first argument if the second argument is 1')
assertTrue (d == 'HoHoHo', 'string.rep() should return a string containing the first argument repeated the second argument number of times')




-- reverse

local a = string.reverse ('');
local b = string.reverse ('x');
local c = string.reverse ('tpircSavaJ');

assertTrue (a == '', 'string.reverse() should return an empty string if passed an empty string')
assertTrue (b == 'x', 'string.reverse() should return the first argument if its length is 1')
assertTrue (c == 'JavaScript', 'string.reverse() should return a string containing the first argument reversed')




-- sub

local a = 'Pub Standards'

local b = string.sub (a, 1)
local c = string.sub (a, 5)
local d = string.sub (a, -4)

local e = string.sub (a, 1, 3)
local f = string.sub (a, 7, 9)
local g = string.sub (a, -4, -2)

local h = string.sub (a, 5, -2)
local i = string.sub (a, 0)

assertTrue (b == 'Pub Standards', 'string.sub() should return the first argument if the second argument is 1')
assertTrue (c == 'Standards', 'string.sub() should return a subset of the first argument from the nth character onwards, when n is the second argument and positive')
assertTrue (d == 'ards', 'string.sub() should return the last n characters of the first argument, where n is the absolute value of the second argument and the second argument is negative')
assertTrue (e == 'Pub', 'string.sub() should return the first n characters of the first argument when the second argument is one and n is the third argument')
assertTrue (f == 'and', 'string.sub() should return a subset of the first argument from the nth character to the mth character, when n is the second argument and positive and m is the third argument and negative')


assertTrue (h == 'Standard', 'string.sub() should return a subset of the first argument from the nth character to the last but mth character, when n is the second argument and positive and m is the third argument and negative')
assertTrue (i == 'Pub Standards', 'string.sub() should return a subset of the first argument from the last but nth character to the last but mth character, when n is the second argument and negative and m is the third argument and negative')




-- upper

local a = string.upper ('');
local b = string.upper ('JavaScript');

assertTrue (a == '', 'string.upper() should return an empty string if passed an empty string')
assertTrue (b == 'JAVASCRIPT', 'string.upper() should return the first argument in uppercase')








showResults()

