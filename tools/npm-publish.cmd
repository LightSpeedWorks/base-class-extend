@set HERE=%~dp0
@pushd %HERE%
@cd ..
@call npm publish
node tools/string-replace base-class-extend new-base-class package.json README.md test/base-class-animal-test.js test/base-class-test-en.js test/base-class-test-jp.js test/base-class-vector-test.js test/base-class-function-test.js test/base-class-object-test.js test/base-class-private-test.js
@call npm publish
node tools/string-replace new-base-class base-class-extend package.json README.md test/base-class-animal-test.js test/base-class-test-en.js test/base-class-test-jp.js test/base-class-vector-test.js test/base-class-function-test.js test/base-class-object-test.js test/base-class-private-test.js
@popd
pause
