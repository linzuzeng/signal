all: p5.sound.js
	python -m SimpleHTTPServer
push: p5.sound.js
	java -jar compiler.jar --js_output_file=../signal-public/sketch.js p5.js sketch.js p5.dom.js  p5.sound.js
	cd ../signal-public; git commit -a;git push
p5.sound.js:
	
	cp p5.js-sound/lib/p5.sound.js p5.sound.js 
