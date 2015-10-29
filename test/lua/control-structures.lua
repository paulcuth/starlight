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
