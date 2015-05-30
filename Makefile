all:
	python -m SimpleHTTPServer
push:
	cd ../signal-public; git commit -a;git push
