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



local a, b, i = 0, 0, 0

for i = 1, 5 do
	a = a + 1
	b = b + i
end

assertTrue (a == 5, 'For loop should iterate the correct number of times')
assertTrue (b == 15, 'For loop variable should hold the value of the current iteration')


local funcs = {}
local b = ''

for i = 1, 3 do
	table.insert(funcs, function () b = b..i end)
end

funcs[1]()
funcs[2]()
funcs[3]()
assertTrue (b == '123', 'Each loop of numeric for should maintain its own scope')	




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

assertTrue (b[1]() == 1, 'Local within a closure should keep its value [1]')
assertTrue (b[2]() == 2, 'Local within a closure should keep its value [2]')
assertTrue (b[3]() == 3, 'Local within a closure should keep its value [3]')

b = ''
i = 1
for i = 1, 4 do
	b = b..i
	break
end
assertTrue (b == '1', 'Break should exit numerical for loop')


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
t = {1,2,3}
for key, val in pairs(t) do
	a = a..'['..tostring(key)..'=='..tostring(val)..']'
	break
end
assertTrue (a == '[1==1]', 'Break should exit generic for loop')


function iter(t, i)
  if i < 5 then
 	  return i + 1, i
	else
		return nil
	end
end	
a = ''
for key, val in iter, {}, 2 do
	a = a..'['..tostring(key)..'=='..tostring(val)..']'
end
assertTrue (a == '[3==2][4==3][5==4]', 'Generic for loop should accept an expression list')	

function iter(t, i)
	i = i + 1
	v = t[i]
	if v then
 	  return i, v, v * 2
	end
end	
a = ''
for x,y,z in iter, {4,5,6}, 0 do
	a = a..'['..tostring(x)..','..tostring(y)..','..tostring(z)..']'
end
assertTrue (a == '[1,4,8][2,5,10][3,6,12]', 'Generic for loop should pass all values returned from iterator to the variables in the loop')	


local funcs = {}
local a = {1,2,3}
local b = ''

for _, i in ipairs(a) do
	table.insert(funcs, function () b = b..i end)
end

funcs[1]()
funcs[2]()
funcs[3]()
assertTrue (b == '123', 'Each loop of generic for should maintain its own scope')	


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

b = ''
i = 1
while i < 4 do
	b = b..i
	i = i + 1
	break
end
assertTrue (b == '1', 'Break should exit while loop')


local funcs = {}
local b = ''
i = 1

while i < 4 do
	table.insert(funcs, function () b = b..i end)
	i = i + 1
end

funcs[1]()
funcs[2]()
funcs[3]()
assertTrue (b == '444', 'Each loop of while should not maintain its own scope')	



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


b = ''
i = 1
repeat
	b = b..i
	i = i + 1
	break
until i == 4
assertTrue (b == '1', 'Break should exit repeat loop')


local funcs = {}
local b = ''
i = 1

repeat
	table.insert(funcs, function () b = b..i end)
	i = i + 1
until i == 4

funcs[1]()
funcs[2]()
funcs[3]()
assertTrue (b == '444', 'Each loop of repeat should not maintain its own scope')	


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


b = nil
a = function () 
	return false, true
end

if a() then
	b = 'THIS SHOULD NOT EXECUTE'
end
assertEqual (b, nil, 'If clause with function call should only use first returned value. [1]')

b = nil
a = function () 
	return true, false
end

if a() then
	b = 'THIS SHOULD EXECUTE'
end
assertEqual (b, 'THIS SHOULD EXECUTE', 'If clause with function call should only use first returned value. [2]')


-- do block

local a = 1
local b = 10
do
	local a = 2
	b = 20
	assertEqual (a, 2, 'Do block should use local variables')
	assertEqual (b, 20, 'Do block should set upvalues')
end
assertEqual (a, 1, 'Do block should create its own local variable scope')
assertEqual (b, 20, 'Do block should update upvalues')

a = '1'
function testReturn()
	a = a..'2'
	do
		a = a..'3'
		return
	end
	a = a..'X'
end

testReturn()
assertEqual (a, '123', 'Do block containing return should return from parent function')

