
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





showResults()

