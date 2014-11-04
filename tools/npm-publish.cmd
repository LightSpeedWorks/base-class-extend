@set HERE=%~dp0
@pushd %HERE%
@cd ..
@call npm publish
node tools/string-replace base-class-extend new-base-class package.json README.md test/quick.js test/animal-test.js test/test-en.js test/test-jp.js test/vector-test.js test/function-test.js test/object-test.js test/private-test.js
@call npm publish
node tools/string-replace new-base-class base-class-extend package.json README.md test/quick.js test/animal-test.js test/test-en.js test/test-jp.js test/vector-test.js test/function-test.js test/object-test.js test/private-test.js
@popd
pause
