var mic, fft, song, capture = false,
  capture_t = 0,recording=false,playing=false;
var last_three=[0,0,0];
var round_last = "";
var captured=piano;
var amp_trig=0;

fft_f = 8192;
low_f = 214.84375;
length_f = 248;
trigger_amp=2/5;
var spectrum_log_last=[];
var amp_per_note_last ={};
var record_start_time;
var record =[];
var timerlist=[];

var kill=[];
function check_max(a){
	if (last_three[3]!=a)
	{
		last_three[1]=last_three[2];
		last_three[2]=last_three[3];
		last_three[3]=a;
		return (last_three[2]>last_three[1])&&(last_three[2]>last_three[3]);
	}
}
function mulitply1(a, standard) {
	if (standard) {
		var total1 = 0, base1 = 0, base2 = 0;
		for (var i = 0; i < standard.length; i++){
			total1 += a[i] * standard[i];
			base1 += standard[i] * standard[i];
			base2 += a[i] * a[i];

			if (base1==0)
				base1=1e-6;
			if (base2==0)
				base2=1e-6;
		}
		return  {
				like:(total1 * total1) / (base1 * base2), 
				amp:total1 / base1
			};
	} else {
		return {
				like:0,
				amp:0
			};
	}
}


function preload() {
	notes=[]
	// Load a sound file
	song = new p5.SoundFile("");
	for (var i=32;i<=108;i++)
		notes[i]=new p5.SoundFile("./sound/"+i.toString()+".ogg");
}

function startstop() {
	if (!song.isLoaded()) {
		button.html("mic");
		fft.setInput(mic);
	} else {
		if (song.isPlaying()) {
			button.html("mic");
			fft.setInput(mic);
			mic.connect(fft);
			song.stop();
		} else {
			button.html("file");
			song.play();
			fft.setInput(song);
			mic.disconnect();
		}
	}
}

function handleFiles(files) {
	song.setPath(files.data);
	button.html("file/mic");
}
function setup() {
	createElement('h2', 'Homework for Signal & Systems - FFT spectrum analyzer');
	createElement('h', 'Input:');
	button = createButton('mic');
	button.mousePressed(startstop);
	createElement('h', 'File:');
	createFileInput(handleFiles);
	
	//prompt = createElement('h', 'Profile (DEFAULT:piano): ');
	//button_capture = createButton("Capture")
	createElement('h', 'Record: ');
	button_mode = createButton("Record");
	button_mode.mousePressed(function(){
		recording = !recording;
		if (recording){
			button_mode.html('Stop');
			record=[];
			result.html("--");
			timestamp=0;
			record_start_time= Math.floor(performance.now());
		}
		else {
			button_mode.html('Record');
		}
	});
	createElement('br');
	createElement('h', 'Identified notes: ');
	linear_identify = createElement('h', '--');
	createElement('br');
	createElement('h', 'High-amp notes: ');
	amp_identify = createElement('h', ' (amp-method, may be incorrect) ');
	createElement('br');

	createElement('br');
	createElement('br');
	createCanvas(1200, 500);
	createElement('br');
	createElement('br');
	button_play = createButton("Play");
	button_play.mousePressed(function(){
		
		if (record.length<=0)
			alert("No record!");
		else
			playing=!playing;

		if (playing){
			button_play.html('Stop');
			recording=false;
			for (var i=0; i<record.length; i++)
				timerlist[i]=setTimeout("notes["+record[i].note.toString()+"].play()",record[i].time);
			timerlist[timerlist.length]=setTimeout("playing=false;button_play.html('Play');",record[record.length-1].time);
		}
		else
		{
			button_play.html('Play');
			for (var i=0; i<timerlist.length; i++)
				clearTimeout(timerlist[i]);
		}	
	});
	
	
	result = createElement('h', '--');
	/*button_capture.mousePressed(function(){
		capture = !capture;
		if (capture){
			captured=[];
			amp_trig=0;
		}
		else {
			result.html(JSON.stringify(captured));
			prompt.html( 'Profile (DEFAULT:piano): ');
		}
	});
*/
	noFill();

	mic = new p5.AudioIn();
	mic.start();
	mic.disconnect();

	fft = new p5.FFT(0, fft_f);
	fft.setInput(mic);
}

function draw() {

	//caculate spectrum
	var spectrum = fft.analyze();
	var spectrum_log_now = [];
	var spectrum_log= [];
	for (var i = low_f * fft_f / 22000, a = 0; i < spectrum.length; i *= Math.pow(2, 1 / length_f), a++) {
		spectrum_log_now[a] = 0;
		// energy
		for (b = Math.floor(i / Math.pow(2, 1 / length_f)); b <= Math.floor(i); b++)
			if (spectrum[b] > spectrum_log_now[a])
		spectrum_log_now[a] = spectrum[b] * spectrum[b] ;
		//derivative
		if (spectrum_log_last.length>=a)
			spectrum_log[a] = spectrum_log_now[a]-spectrum_log_last[a];
		else
			spectrum_log[a] = spectrum_log_now[a];
	 
	 }
	//quantify
	var max_in_spectrum =1;
	for (var i=0; i<spectrum_log.length; i++)
		if (max_in_spectrum<spectrum_log[i])
			max_in_spectrum=spectrum_log[i];
	for (var a=0; a<spectrum_log.length; a++)
	{
		spectrum_log[a]=Math.floor(spectrum_log[a]/max_in_spectrum*spectrum_log_now[a]*1.3);
		if (spectrum_log[a]<0) spectrum_log[a]=0;
	}

	//draw spectrum
	background(200);
	stroke("red");
	beginShape();
	for (var a = 0; a < spectrum_log.length; a++) 
		vertex(a, map(spectrum_log[a], 0, 256*256, height, 0));
	endShape();
	stroke("black");
	beginShape();
	for (var a = 0; a < spectrum_log.length; a++) 
		vertex(a, map(spectrum_log_now[a], 0, 256*256, height, 0));
	endShape();

	//draw note
	var offset_f = Math.floor(Math.log(55 / low_f) / Math.log(Math.pow(2, 1 / length_f)));
	beginShape();
	var str = ["1", "1#", "2", "2#", "3", "4", "4#", "5", "5#","6", "6#", "7" ];
	for (var a = 0, n = 0; a < spectrum_log.length; n++, a = Math.floor(offset_f + length_f * n / 12)) {
		switch (n % 12) {
			case 3:
			{
				stroke("black");
				text((Math.floor(n/12)+2).toString(), a + 3, 10);
				stroke("blue");
				line(a, 0, a, map(spectrum_log[a], 0, 256*256, height, 0));
				break;
			}
			case 0:
			{
				stroke("black");
				text("A", a + 3, 10);
				stroke("green");
				line(a, 0, a, map(spectrum_log[a], 0, 256*256, height, 0));
				break;
			}
		}
		stroke("black");
		text(str[(n+21) % 12], a + 3, 30);
		stroke("white");
		line(a, 0, a, 100);
	}
	endShape();
	// amp filter & draw graph
	var got_freq = new Set(); 
	beginShape();
	strokeWeight(10);
	stroke("purple");
	for (var a = 0, n = 0; a < spectrum_log.length; n++, a = Math.floor(offset_f + length_f * n / 12)) 
		for (var bb = a - Math.floor(length_f / (12*3)) - 1; 
			bb < a + Math.floor(length_f / (12*3)) + 1; bb++) 
			if (spectrum_log[bb] >  256 *256* trigger_amp) {
				got_freq.add(n+34);
				line(a, 0, a, 100);
				break;
			}
	// caculate got frequency
	var probability = [];
	for (var i=0; i<400 ;i++) 
	{
		probability[i]=0;
		if (got_freq.has(i))
		{
			probability[i]++;
			if ( got_freq.has(i+24))
				probability[i]++;
			if ( got_freq.has(i+12+7))
				probability[i]++;
			if ( got_freq.has(i+12))
				probability[i]++;
		}
	}
	// show got frequency
	var round_this = "";
	if (got_freq.size>0)
	{
		var lowest = 2147483648;
		got_freq.forEach(function(n) {
			round_this +=  str[(n-12-1) % 12]+ " [" + Math.floor((n-12-1) / 12) + "] /"+probability[n]+"/  " ;
			if (lowest>n)
				lowest=n;
		});
	}
	// double check
	// trigger
	var triggered = false;
	if (round_last != round_this)
	{
		if (round_last=="")
		{
			console.log(round_this);
			amp_trig++;
			triggered=true;
		}
		amp_identify.html(round_this);
	}
	round_last = round_this;
	
	//dies out
	for (var n=0; n<kill.length ;n++)
	{
		if (kill[n])
		{
			if (kill[n]>0)
				kill[n]--;
		}
		else
		{
			kill[n]=0;
		}
	}
	// get best fitted note	
	var best_n=-1;
	var best_times=0;
	for (var n=0; n<probability.length ;n++)
	{
		
		if ((best_times<probability[n]) )
		{
			best_n=n;
			best_times=probability[n];
		}
	}
	if (kill[best_n]>0)
		best_n=-1;
	if (best_n!=-1 )
		linear_identify.html(str[(best_n-12-1) % 12]+ " [" + Math.floor((best_n-12-1) / 12) + "]");
	
	kill[best_n]=0;
	for (var n=0; n<kill.length ;n++)
	{
		if (probability[n]>0)
			kill[n]=5;
	}
	if (triggered)
	{
		// capture note spectrum
		if (capture) {
				captured[capture_t++]=spectrum_log;
				prompt.html( 'Profile (triggered'+capture_t.toString()+' times.): ');
		}
	}

	
	strokeWeight(1);
	endShape();

	// record
	if ((!capture) && recording)  
		if (best_n!=-1){
			var n=best_n;
			record[record.length]={
				time:Math.floor(performance.now())-record_start_time,
				note:best_n
			};
			result.html(result.html()+" ~ "+str[(n-12-1) % 12]  + " [" +Math.floor((n-12-1) / 12)+ "] " );
	}
	
	spectrum_log_last=spectrum_log_now;
}
