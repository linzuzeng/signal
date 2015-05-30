all:
	python -m SimpleHTTPServer
push:
	java -jar compiler.jar --js_output_file=../signal-public/sketch.js p5.js sketch.js p5.dom.js  p5.sound.js
	cd ../signal-public; git commit -a;git push
