
print 'Hello world'

for f = 5, 1, -1 do
	print(f..',')
end

print 'Lift off!'

-- for f = 1, 5 do
-- 	print(f..'..')
-- end

-- local t = {}
-- t.test = 123

-- print (t.test)

-- function moo ()
-- 	print 'moo'
-- end

-- moo()



-- do
-- 	local passed, failed = 0, 0

-- 	function reportError (message)
-- 		print('- '..message)
-- 	end

-- 	function assertTrue (condition, message)
-- 		if not condition then 
-- 			failed = failed + 1
-- 			reportError(message)
-- 		else
-- 			passed = passed + 1
-- 		end
		
-- 		return condition
-- 	end
	
-- 	function assertEqual (actual, expected, message)
-- 		if actual ~= expected and (actual == actual or expected == expected) then 
-- 			failed = failed + 1
-- 			reportError(message..'; expected "'..tostring(expected)..'", got "'..tostring(actual)..'".')
-- 		else
-- 			passed = passed + 1
-- 		end
-- 	end

-- 	function showResults ()		
-- 		local durationStr = ''

-- 		print "\n------------------------"
-- 		if failed == 0 then
-- 			print " Passed."
-- 		else
-- 			print "FAILED!"
-- 		end

-- 		print "------------------------\n"		
-- 		print ("Total asserts: "..(passed + failed).."; Passed: "..passed.."; Failed: "..failed..durationStr)
-- 	end

-- end


-- local a = 1
-- assertTrue (a == 1, 'Local should retain value')

-- showResults()

