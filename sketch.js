var mic, mic2,fft,song,capture=false;
fft_f=8192;
low_f=214.84375;
length_f=248;
temp1=[];
function mousePressed() {
	capture=true;
}
function mulitply1(a,standard)
{
	if (standard)
	{

		var total1=0,base1=0,base2=0;
		for (var i=0; i<  standard.length; i++)
		{
			total1+=1.0*a[i]*standard[i];
		}
		
		for (var i=0; i< standard.length; i++)
			base1 +=standard[i]*standard[i];

		for (var i=0; i< a.length; i++)
			base2 +=a[i]*a[i];
		return (total1*total1)/(base1*base2);
	}
	else
	{
		return -1;
	}

}
function preload() {
  // Load a sound file
  song =new p5.SoundFile("");
}
function startstop(){
	if (!song.isLoaded()){
		button.html("mic");
		fft.setInput(mic2);
	}else{

	if ( song.isPlaying() ) { // .isPlaying() returns a boolean
		button.html("mic");
		
		mic2.start();
		fft.setInput(mic2);
		song.stop();
	} else {
		button.html("file");
		song.play();
		
		fft.setInput(song);
		mic2.stop();
	}
}

}

function handleFiles(files) {
	song.setPath(files.data);
	button.html( "file/mic");
}

function setup() {
	createElement('h2', 'Homework for Signal & Systems - FFT spectrum analyzer');
	createElement('h', 'Input:'); 
	button=createButton('mic');
	createElement('h', 'File:'); 
	createFileInput(handleFiles);
	createElement('h', 'Recognize: ');
	recog= createElement('h', 'NaN');  
	createElement('br'); 
	createElement('br'); 
	button.mousePressed(startstop);


	createCanvas(1200,600);
	noFill();
	/*
	mic = new p5.Oscillator(880*4);
	mic.start();
	mic.amp(1);

		mic1= new p5.Oscillator(440*4);
		mic1.start();
		mic1.amp(1);
		mic1.connect(mic);
	*/
	mic2 = new p5.AudioIn();
	mic2.amp(0.5);
	mic2.start();
	//song.connect(mic2);
	fft = new p5.FFT(0,fft_f);
	//song.play();
	fft.setInput(mic2);
}

	function draw() {
		background(200);
		
		var spectrum = fft.analyze();
		var spectrum_log = [];

		for (var i = low_f*fft_f/22000, a=0; i<spectrum.length; i*=Math.pow(2,1/length_f),a++) {
			spectrum_log[a]=0;
			for (b=Math.floor(i/Math.pow(2,1/length_f));  b<=Math.floor(i); b++)
			{
				if (spectrum[b]>spectrum_log[a])
					spectrum_log[a]=spectrum[b];
			}
		}
		if (capture){
			capture=false;
			//console.log(spectrum_log);
			temp1= spectrum_log;
		}
		recog.html(Math.round(mulitply1(spectrum_log,temp1)*100).toString()+"%");
			
		
		beginShape();

		for (var a = 0; a<spectrum_log.length; a++) {
			vertex(a, map(spectrum_log[a], 0, 256, height, 0) );
		}
		endShape();

		var offset_f =Math.floor(Math.log(   55/low_f  )/Math.log(  Math.pow(2,1/length_f)));
		beginShape();


		str=["6","6#" ,"7" ,"1" ,"1#" ,"2" ,"2#" ,"3" ,"4" ,"4#", "5" ,"5#" ];
		for (var a=0,n=0;a<1200;n++,a=offset_f+length_f*n/12)
		{
			switch (n%12){
				case 3:
				{
					stroke("black");
					text("A",a+3,10);
					stroke("blue");
					line(a,0,a,map(spectrum_log[a], 0, 256, height, 0)  );
					break;
				}
				case 0:
				{
					stroke("black");
					text("1",a+3,10);
					stroke("red");
					line(a,0,a,map(spectrum_log[a], 0, 256, height, 0)  );
					break;
				}
			}
			stroke("black");
			text(str[n%12],a+3,30);
			stroke("white");
			line(a,0,a,100);
			
		}
		endShape();
	}