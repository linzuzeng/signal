var fft_analyzer= (function(){
var fft_s = 8192;
var low_n = 32; // bounded with notes
var max_n = 108; 
var std_length_a = 12*12*4;//pxiels
start_a = 800;
start_a_old = 800;
// low_f = Math.floor(440*Math.pow(2,(low_n-70)/12));

var mic, fft, song, capture = false,
  capture_t = 0,recording=false,playing=false;
var last_three=[0,0,0];
var round_last = "";
var captured=[];
var amp_trig=0;
trigger_amp=2/5;
harmonic_filter=20;
var spectrum_log_length=Math.ceil(Math.log(22000/           Math.floor(440*Math.pow(2,(low_n-70)/12))        )/Math.log(2)*std_length_a);
var spectrum_log_last = new Int32Array(spectrum_log_length);
var spectrum_log_now = new Int32Array(spectrum_log_length);
var spectrum_log = new Int32Array(spectrum_log_length);
var got_freq_probability=new Int32Array(max_n);
var got_freq_amp = new Int32Array(max_n);
var got_freq = new Set(); 
var amp_per_note_last ={};
var record_start_time;
var record =[];
var play_record_id=0;
var timer;
var kill=new Int8Array(max_n);
var str_1 = ["1", "1#", "2", "2#", "3", "4", "4#", "5", "5#","6", "6#", "7" ];
var str_2 = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#","A", "A#", "B" ];
var record_result="";
var lastX=null;
touchStarted = function () {
	start_a_old =start_a;
	lastX=null;
};
touchEnded = function () {
	if (!(lastX==null))
		start_a=start_a_old+lastX-touchX;
	lastX=null;
};
touchMoved = function () {
	if (lastX==null)
		lastX=touchX;
	start_a=start_a_old+lastX-touchX;
};
preload = function () {
	notes=[]
	// Load a sound file
	song = new p5.SoundFile(""); // DANGER!
	
	for (var i=32;i<=108;i++)
		notes[i]=new p5.SoundFile("./sound/"+i.toString()+".ogg");
};
function check_max(a){
	if (last_three[3]!=a)
	{
		last_three[1]=last_three[2];
		last_three[2]=last_three[3];
		last_three[3]=a;
		return (last_three[2]>last_three[1])&&(last_three[2]>last_three[3]);
	}
};
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
function playnote()
{
	while ((play_record_id<record.length) &&(record[play_record_id].time<performance.now()-record_start_time))
	{
		if (record[play_record_id].time>performance.now()-record_start_time-40){ // force sync
			notes[record[play_record_id].note].amp(record[play_record_id].amp/(256*256));
			notes[record[play_record_id].note].play();
		}
		play_record_id++;
	}
	if (play_record_id>=record.length) 
	{
		clearInterval(timer);
		playing=false;
		button_play.html('Play');
		loop();
	}	
}
setup = function () {
	createElement('h2', 'Homework for Signal & Systems - FFT spectrum analyzer');
	createElement('h', 'Input:');
	button = createButton('mic');
	button.mousePressed(startstop);
	createElement('h', 'File:');
	createFileInput(handleFiles);
	
	//prompt = createElement('h', 'Profile (DEFAULT:piano): ');
	//button_capture = createButton("Capture")
	createElement('h', 'Record: ');
	button_mode = createButton("Start");
	button_mode.mousePressed(function(){
		recording = !recording;
		if (recording){
			button_mode.html('Stop');
			canvas.hide()
			record=[];
			result.html("--");
			record_result="";
			timestamp=0;
			record_start_time= Math.floor(performance.now());
			
		}
		else {
			canvas.show();
			button_mode.html('Start');
			
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
	canvas=createCanvas(1200, 500);
	createElement('br');
	createElement('br');
	button_play = createButton("Play");
	button_play.mousePressed(function(){
		
		if (record.length<=0)
			alert("No record!");
		else
			playing=!playing;

		if (playing){
			noLoop();
			button_play.html('Stop');
			recording=false;
			
			play_record_id=0;
			record_start_time= Math.floor(performance.now());
			timer=setInterval(playnote,10);
		}
		else
		{
			button_play.html('Play');
			clearInterval(timer);
			loop();
		}	
	});
	
	silder=createSlider(-100,500,0);
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

	fft = new p5.FFT(0, fft_s);
	fft.setInput(mic);

};

draw = function () {

	//caculate spectrum
	var spectrum = fft.analyze();

	for (var a = 0; a<spectrum_log_length ;a++) {
		var i = Math.floor( 440*Math.pow(2, (low_n-70)/12)  * Math.pow(2, a / std_length_a) * fft_s / 22000 );
		spectrum_log_now[a] = 0;
		// energy
		for (b = Math.floor(i / Math.pow(2, 1 / std_length_a)); b <= Math.ceil(i); b++)
			spectrum_log_now[a] = max(spectrum_log_now[a],spectrum[b] * spectrum[b]) ;
		//derivative
		spectrum_log[a] = spectrum_log_now[a]-spectrum_log_last[a];
		
	}
	spectrum_log_last.set(spectrum_log_now); // !!!!!!!Profile needed!
	//quantify
	var max_in_spectrum =1;
	for (var a=0; a<spectrum_log.length; a++)
		if (max_in_spectrum<spectrum_log[a])
			max_in_spectrum=spectrum_log[a];
	for (var a=0; a<spectrum_log.length; a++)
	{
		spectrum_log[a]=Math.floor(spectrum_log[a]/max_in_spectrum*spectrum_log_now[a]*1.3);
		if (spectrum_log[a]<0)
			spectrum_log[a]=0;
	}
	var offset_a =  Math.floor(std_length_a*((34-low_n)/12));

	// amp filter & harmonic filter
	var weighted_freq= new Int8Array(spectrum_log.length);
	for (var a = 0; a < spectrum_log.length; a++) 
		if (spectrum_log[a]>  256 * 256 * trigger_amp)
			for (var har_freq=0, har_times=1; har_times<harmonic_filter;  
			har_freq=Math.floor(std_length_a*Math.log(++har_times)/Math.log(2)) )
				if (max([spectrum_log[a-har_freq-1],spectrum_log[a-har_freq],spectrum_log[a-har_freq+1]])
				>  256 * 256 * trigger_amp)
					weighted_freq[a-har_freq]++;

	//  allign frequecty to note & get best fitted note
	var best_n=-1;
	var best_times=0;
	got_freq.clear();
	// BUG!!! offset_a may cause bug!!
	for (var  nn = 0; nn < max_n; nn++) {
		var n=nn+34;
		got_freq_probability[n]=0;
		got_freq_amp[n]=0;
		var a = Math.floor(offset_a + std_length_a * nn / 12);
		for (var bb = a - Math.floor(std_length_a / (12*4)) - 1; 
		bb < a + Math.floor(std_length_a / (12*4)) + 1; bb++) 
			if (weighted_freq[bb] >=1) {
				got_freq.add(n);
				got_freq_probability[n]=max(got_freq_probability[n],weighted_freq[bb]*weighted_freq[bb]*weighted_freq[bb]*spectrum_log_now[bb]);
				got_freq_amp[n]=max(got_freq_amp[n],spectrum_log_now[bb]);
				if ((best_times<got_freq_probability[n]) )
				{
					best_n=n;
					best_times=got_freq_probability[n];
				}
			}
	}
	

	// double check 
	var round_this = "";
	if (got_freq.size>0)
	{
		got_freq.forEach(function(n) {
			if (!kill[n])
				round_this +=  str_1[(n-12-1) % 12]+ " [" + Math.floor((n-12-1) / 12) + "] /"+got_freq_probability[n]+"/  " ;
			else
				if (n==best_n)
					best_n=-1;
		});
	}
	
	// trigger
	var triggered = false;
	if (round_last != round_this)
	{
		if (round_last=="")
		{
			amp_trig++;
			triggered=true;
		}
		amp_identify.html(round_this);
	}
	round_last = round_this;
	
	// dies out in time
	for (var n=0; n<kill.length ;n++)
		if (kill[n])
			kill[n]--;
	
	
	// note truly pressed
	if (best_n!=-1)
	{
		kill[best_n]=6;
		kill[best_n+12]=8;
		kill[best_n+12+7]=8;
		kill[best_n+12+12]=8;
		linear_identify.html(str_1[(best_n-12-1) % 12]+ " [" + Math.floor((best_n-12-1) / 12) + "]");
	}
	// CANON specical trick!!!
	if ((best_n-12-1) / 12<=3)
		best_n=-1;
	// 1945 specical trick!!!
	if ((best_n-12-1) / 12>7)
		best_n=-1;
	if (triggered)
	{
		// capture note spectrum
		if (capture) {
				captured[capture_t++]=spectrum_log;
				prompt.html( 'Profile (triggered'+capture_t.toString()+' times.): ');
		}
	}

	// record
	if ((!capture) && recording)  
		if (best_n!=-1){
			var n=best_n;
			//console.log(amp_identify.html())
			record[record.length]={
				time:Math.floor(performance.now())-record_start_time,
				note:best_n,
				amp:got_freq_amp[n]
			};
			record_result+=" ~ "+str_1[(n-12-1) % 12]  + " [" +Math.floor((n-12-1) / 12)+ "] ";
			result.html(record_result);
	}
/////////////////////////////////////////////////////////////////////////
	
	if (!recording){
		// draw spectrum
		background(200);
		stroke("red");
		beginShape();
		for (var p = 0; p < width; p++) 
			vertex(p, map(spectrum_log[p+start_a], 0, 256*256, height, 0));
		endShape();
		stroke("black");
		beginShape();
		for (var p = 0; p < width; p++) 
			vertex(p, map(spectrum_log_now[p+start_a], 0, 256*256, height, 0));
		endShape();
		// draw notes
		beginShape();
		
		for (var n = 0; n < max_n; n++) {
			var p = Math.floor(offset_a + std_length_a * n / 12);
			switch (n % 12) {
				case 3:
				{
					stroke("black");
					text((Math.floor(n/12)+2).toString(), p -start_a+ 3, 10);
					stroke("blue");
					line(p-start_a, 0, p-start_a, height);
					break;
				}
				case 0:
				{
					stroke("black");
					text("A", p-start_a + 3, 10);
					stroke("green");
					line(p-start_a, 0, p-start_a, height);
					break;
				}
			}
			stroke("black");
			text(str_1[(n+21) % 12], p-start_a + 3, 30);
			stroke("white");
			line(p-start_a, 0, p-start_a, 100);
		}
		endShape();
		// draw got notes
		beginShape();
		strokeWeight(10);
		stroke("purple");
		for (var  n = 0; n < max_n; n++) {
			var a = Math.floor(offset_a + std_length_a * n / 12);
			line(a-start_a, 0, a-start_a, Math.ceil(got_freq_probability[n+34]/best_times*100));
		}
		strokeWeight(1);
		endShape();
	};
};
})();
