console.log('Start');
var Update_Loading_Value=0;
const myAudio=document.createElement("audio");

//----
var track_name=localStorage.getItem("track_name");
if((track_name==null) || (track_name===undefined)) track_name="TrackName";

var track_author=localStorage.getItem("track_author");
if((track_author==null) || (track_author===undefined)) track_author="TrackAuthor";

if((track_name!="TrackName") && (track_author!="TrackAuthor")) document.title=track_name+" - "+track_author;


var track_id=localStorage.getItem("track_id");
if(track_id==null) track_id=0;

var repeat_flag=parseInt(localStorage.getItem("repeat_flag"));
if((repeat_flag==null) || isNaN(repeat_flag)) repeat_flag=0;
var shuffle_flag=parseInt(localStorage.getItem("shuffle_flag"));
if(shuffle_flag==null){
	shuffle_flag=false;
} else{
	shuffle_flag=(shuffle_flag==1);
}
var volume=parseInt(localStorage.getItem("volume"));
if((volume==null) || isNaN(volume)) volume=50;
var track_loaded=false;
var trackname=document.getElementById("trackname");
trackname.innerHTML=track_name;
var trackauthor=document.getElementById("trackauthor");
trackauthor.innerHTML=track_author;

var tracktime=document.getElementById("tracktime");

var trackinMyMusic=false;
var Starting=false;
var search_value="";

var MyMusic_element=document.getElementById("MyMusic");
var AllMusic_element=document.getElementById("AllMusic");

var MyMusic_switch=localStorage.getItem("MyMusic_switch");
if(MyMusic_switch==null){
	MyMusic_switch=true;
} else MyMusic_switch=MyMusic_switch=="true";
MyMusic_element.checked=MyMusic_switch;
var AllMusic_switch=localStorage.getItem("AllMusic_switch");
if(AllMusic_switch==null){
	AllMusic_switch=true;
} else AllMusic_switch=AllMusic_switch=="true";
AllMusic_element.checked=AllMusic_switch;
//----

var play=document.getElementById("play");
var pause=document.getElementById("pause");
var shuffle_element=document.getElementById("shuffle_flag");
var repeat_element=document.getElementById("repeat_flag");
var for_repeat_element=document.getElementById("for_repeat");
var add_to_music=document.getElementById("add_to_music");
var del_from_music=document.getElementById("del_from_music");//NEW-----------
var MusicList_box=document.getElementById("MusicList_box");


var slider=document.getElementById("slider_range");

var track_list=[];

function playpause(argument){
	if(Starting) return true;
	Starting=true;
	const divs=MusicList_box.getElementsByTagName('div');
	for (const div of divs) {
		var track=track_list[parseInt(div.getAttribute("data"))];
		if((track!==undefined) && (track["track_id"]==track_id)) {
			div.classList.add("Active_Track_box");
		} else{
			div.classList.remove("Active_Track_box");
		}
	}
	if(myAudio.paused) {
		if(track_loaded){
			if(myAudio.play()) {
				pause.style.display="block";
				play.style.display="none";
			} else{
				pause.style.display="none";
				play.style.display="block";
			}
		} else{
			myAudio.load();
			myAudio.src="";
			Loading_Timer=setInterval(Update_Loading_Timer,20);
			load_track(track_id).then(response => {
				myAudio.src="data:audio/mpeg;base64,"+response.source;
				clearInterval(Loading_Timer);
				if(argument){
					track_loaded=true;
					Starting=false;
					return true;
				}
				if(myAudio.play()) {
					pause.style.display="block";
					play.style.display="none";
					track_loaded=true;
				} else{
					pause.style.display="none";
					play.style.display="block";
					track_loaded=false;
				}
				Starting=false;
			}).catch(response => {
				clearInterval(Loading_Timer);
				pause.style.display="none";
				play.style.display="block";
				Starting=false;
			});
		}
	} else {
		myAudio.pause();
		pause.style.display="none";
		play.style.display="block";
	}
	Starting=false;
}
function getRandomInt(max) {
	return Math.floor(Math.random()*(max+1));
}
function skip(side){
	localStorage.setItem("track_name",track_name);
	localStorage.setItem("track_author",track_author);
	localStorage.setItem("track_id",track_id);
	if(track_list.length==0) return true;
	var real=-1;
	for(const index in track_list){
		if(track_list[index].track_id==track_id){
			real=parseInt(index);
			break;
		}
	}
	var output=0;
	if(shuffle_flag){
		if(track_list.length>=2){
			output=getRandomInt(track_list.length-2);
			if(output==real) output+=1;
		}
	} else{
		if(side==0){
			if((real==0) || (real==-1)){
				output=track_list.length-1;
			} else{
				output=real-1;
			}
		} else{
			if((real==(track_list.length-1)) || (real==-1)){
				output=0;
			} else{
				output=real+1;
			}
		}
	}
	const timed=track_list[output.toString()];
	if(timed===undefined) return true;
	if(!myAudio.paused) myAudio.pause();
	track_name=timed.name;
	track_author=timed.author;
	track_id=timed.track_id;
	document.title=track_name+" - "+track_author;
	trackname.innerHTML=track_name;
	trackauthor.innerHTML=track_author;
	localStorage.setItem("track_name",track_name);
	localStorage.setItem("track_author",track_author);
	localStorage.setItem("track_id",track_id);
	track_loaded=false;
	playpause();
}
function ended(argument){
	console.log('Ended with func');
	switch(repeat_flag) {
		case 0://Nothing to do
			pause.style.display="none";
			play.style.display="block";
			break;
		case 1://Play to the end of the list
			skip(1);
			break;
		case 2://Replay this one
			myAudio.play();
			break;
		default:
			break;
	}
}
function load_track(id){
	return $.ajax({
		url: LOAD_MUSIC_URL,
		type: "POST",
		beforeSend: function(request) {
			request.setRequestHeader("X-CSRFToken", getCookie("csrftoken"));
		},
		mode: "same-origin",
		data: {"ID": id},
		dataType: "json",
		error: function(response) {console.log("Error on download music",response);}
	});
}
function shuffle(argument){
	if(argument instanceof PointerEvent) {
		shuffle_flag=!shuffle_flag;
	} else {
		shuffle_flag=argument;
	}
	localStorage.setItem("shuffle_flag",shuffle_flag?"1":"0");
	if(shuffle_flag){
		shuffle_element.style.color="var(--second-color)";
	} else{
		shuffle_element.style.color="var(--third-color)";
	}
}
function repeat(argument){
	if(argument instanceof PointerEvent) {
		if(repeat_flag!=2) repeat_flag++;
		else repeat_flag=0;
	} else {
		repeat_flag=argument;
	}
	localStorage.setItem("repeat_flag",repeat_flag.toString());
	switch(repeat_flag) {
		case 0:
			repeat_element.style.color="var(--third-color)";
			for_repeat_element.style.color="transparent";
			break;
		case 1:
			repeat_element.style.color="var(--second-color)";
			for_repeat_element.style.color="transparent";
			break;
		case 2:
			repeat_element.style.color="var(--second-color)";
			for_repeat_element.style.color="currentColor";
			break;
		default:
			break;
	}
}
function addtomusic(arg){
	if(arg===undefined) {
		trackinMyMusic=!trackinMyMusic;
	} else{
		trackinMyMusic=arg;
	}
	if(trackinMyMusic){
		add_to_music.style.transform="rotate(45deg)";
	} else{
		add_to_music.style.transform="none";
	}
}
function changeVolume(arg){
	volume=arg;
	myAudio.volume=volume/100;
	localStorage.setItem("volume",volume.toString());
}
function UpdateRange(argument){
	if(myAudio.duration!==undefined) {
		set_point(myAudio.currentTime/myAudio.duration);
		var seconds=Math.floor(myAudio.currentTime);
		tracktime.innerHTML=Math.floor(seconds/60)+":"+(((seconds%60)<10)?"0":"")+(seconds%60).toString();
	}
}
function StartTrack(argument){
	var music_id=parseInt(argument.getAttribute("data"));
	var timed=undefined;
	for (const index in track_list) {
		if(track_list[index].track_id==music_id){
			timed=track_list[index];
			break;
		}
	}
	if(timed===undefined) return true;
	if(!myAudio.paused) myAudio.pause();
	track_name=timed.name;
	track_author=timed.author;
	track_id=timed.track_id;
	document.title=track_name+" - "+track_author;
	trackname.innerHTML=track_name;
	trackauthor.innerHTML=track_author;
	localStorage.setItem("track_name",track_name);
	localStorage.setItem("track_author",track_author);
	localStorage.setItem("track_id",track_id);
	track_loaded=false;
	playpause();
}

function load_tracklist(){
	MyMusic_switch=MyMusic_element.checked;
	AllMusic_switch=AllMusic_element.checked;
	localStorage.setItem("MyMusic_switch",MyMusic_switch);
	localStorage.setItem("AllMusic_switch",AllMusic_switch);
	return $.ajax({
		url: LOAD_MUSICLIST_URL,
		type: "POST",
		beforeSend: function(request) {
			request.setRequestHeader("X-CSRFToken", getCookie("csrftoken"));
		},
		mode: "same-origin",
		data: {
			"q":search_value,
			"mymusic":MyMusic_switch?"true":"false",
			"allmusic":AllMusic_switch?"true":"false"},
		dataType: "json",
		success: function(response){
			MusicList_box.innerHTML="";
			track_list=[];
			for (const index in response) {
				data=response[index];
				/*<img src="assets/test.jpg" alt="Icon" class="icon">*/
				data["time"]="0:00"
				MusicList_box.innerHTML+=get_track_html(title=data["name"],author=data["author"],image=data["image"],id=data["id"],time=data["time"]);
				track_list.push({name:data["name"],author:data["author"],image:data["image"],track_id:data["id"]});
			}
		},
		error: function(response) {console.log("Error on load tracklist",response);}
	});
}
function search(value){
	search_value=value;
	load_tracklist();
}
function get_track_html(title,author,image,id,time) {
	return '<div class="track" onclick="StartTrack(this)" data='+id+'>\
		<div class="author">'+author+'</div>\
		<div class="title">'+title+'</div>\
		<div class="image">'+image+'</div>\
		<div class="actions">\
			<svg class="add-icon" width="46" height="46" viewBox="0 0 46 46" fill="none" xmlns="http://www.w3.org/2000/svg">\
				<line x1="23" y1="36" x2="23" y2="10" stroke="currentColor" stroke-width="4" stroke-linecap="round"/>\
				<line x1="10" y1="23" x2="36" y2="23" stroke="currentColor" stroke-width="4" stroke-linecap="round"/>\
				<rect x="1" y="1" width="44" height="44" rx="21" stroke="currentColor" stroke-width="2"/>\
			</svg>\
			<svg class="add-icon" width="46" height="46" viewBox="0 0 46 46" fill="none" xmlns="http://www.w3.org/2000/svg">\
				<line x1="32.3847" y1="32.2131" x2="13.9999" y2="13.8284" stroke="currentColor" stroke-width="4" stroke-linecap="round"/>\
				<line x1="14" y1="32.3847" x2="32.3848" y2="13.9999" stroke="currentColor" stroke-width="4" stroke-linecap="round"/>\
				<rect x="1" y="1" width="44" height="44" rx="21" stroke="currentColor" stroke-width="2"/>\
			</svg>\
			<svg class="add-icon" width="46" height="46" viewBox="0 0 46 46" fill="none" xmlns="http://www.w3.org/2000/svg">\
				<path d="M24.5 11C24.5 10.1716 23.8284 9.5 23 9.5C22.1716 9.5 21.5 10.1716 21.5 11H24.5ZM21.9393 36.0607C22.5251 36.6464 23.4749 36.6464 24.0607 36.0607L33.6066 26.5147C34.1924 25.9289 34.1924 24.9792 33.6066 24.3934C33.0208 23.8076 32.0711 23.8076 31.4853 24.3934L23 32.8787L14.5147 24.3934C13.9289 23.8076 12.9792 23.8076 12.3934 24.3934C11.8076 24.9792 11.8076 25.9289 12.3934 26.5147L21.9393 36.0607ZM21.5 11V35H24.5V11H21.5Z" fill="currentColor"/>\
				<rect x="1" y="1" width="44" height="44" rx="21" stroke="currentColor" stroke-width="2"/>\
			</svg>\
			<div class="time">'+time+'</div>\
		</div>\
	</div>'
}
/*
----------------------
----------------------
----------------------
*/
function polarToCartesian(centerX,centerY,radius,angleInDegrees) {
	var angleInRadians=(angleInDegrees-90)*Math.PI/180.0;
	return {
		x:centerX+(radius*Math.cos(angleInRadians)),
		y:centerY+(radius*Math.sin(angleInRadians))
	};
}

function describeArc(x,y,radius,startAngle,endAngle){
	var start=polarToCartesian(x,y,radius,endAngle);
	var end=polarToCartesian(x,y,radius,startAngle);
	var largeArcFlag=endAngle-startAngle<=180?"0":"1";
	pos.x=start.x;
	pos.y=start.y;
	if(isNaN(start.x)) return false;
	var d=[
		"M",start.x,start.y,
		"A",radius,radius,0,largeArcFlag,0,end.x,end.y
	].join(" ");
	return d;
}
arc=document.getElementById("arc");
full_arc=document.getElementById("full_arc");
arc_pos=document.getElementById("arc_pos");
var pos={x:0,y:0};
function set_point(percent,color){
	if(color===undefined) color="#000000";
	var angle=percent*360;
	var d=describeArc(50,50,48,0,angle);
	if(d==false) return false;
	if(angle>=360) {
		full_arc.setAttribute("stroke",color);
		arc.setAttribute("stroke","none");
	} else {
		arc.setAttribute("stroke",color);
		full_arc.setAttribute("stroke","none");
		arc.setAttribute("d",d);
	}
	arc_pos.setAttribute("cx",pos.x);
	arc_pos.setAttribute("cy",pos.y);
}

function addMouseDownListener(arg) {
	$(arg).on("mousedown",onMouseDownHandler);
}
function removeMouseDownListener(arg) {
	$(arg).off("mousedown",onMouseDownHandler);
}

function addMouseUpListener(arg) {
	$(arg).on("mouseup",onMouseUpHandler);
}
function removeMouseUpListener(arg) {
	$(arg).off("mouseup",onMouseUpHandler);
}

function onMouseDownHandler() {
	document.onselectstart= () => {return false;};
	$(document).on("mousemove",onMouseMoveHandler);
}
function onMouseUpHandler() {
	document.onselectstart= () => {};
	$(document).off("mousemove",onMouseMoveHandler);
}
function onMouseMoveHandler(e) {
	let pos=document.getElementsByClassName("trackrange")[0].getBoundingClientRect();
	ark=Math.atan2(e.pageY-pos.height/2-pos.y-window.scrollY,e.pageX-pos.width/2-pos.x)*180/Math.PI;
	if(ark<0) ark=360+ark;
	ark=(ark+90)%360;
	myAudio.currentTime=ark*myAudio.duration/360;
	set_point(ark/360);
}

set_point(0);
addMouseDownListener(arc_pos);
addMouseUpListener(document);
function Update_Loading_Timer(){
	set_point(Update_Loading_Value,"var(--main-color)");
	if(Update_Loading_Value>=1){
		Update_Loading_Value=0;
	}
	Update_Loading_Value+=.01;
}
var Loading_Timer=setInterval(Update_Loading_Timer,20);//20
clearInterval(Loading_Timer);


repeat(repeat_flag);
shuffle(shuffle_flag);
changeVolume(volume);
addtomusic(trackinMyMusic);
add_to_music.onclick=addtomusic;
slider.value=volume;
slider.oninput=function() {
	changeVolume(this.value);
}
shuffle_element.onclick=shuffle;
repeat_element.onclick=repeat;
play.onclick=playpause;
pause.onclick=playpause;

myAudio.addEventListener("ended",ended);
var updateTimer=setInterval(UpdateRange,100);

load_tracklist();
playpause(true);

console.log('End');





