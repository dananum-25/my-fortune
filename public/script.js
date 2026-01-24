const grid = document.getElementById("grid");
const confirm = document.getElementById("confirm");
const goBtn = document.getElementById("go");
const bigCards = document.querySelectorAll(".big-card");

let selected = [];

for(let i=0;i<78;i++){
  const d=document.createElement("div");
  d.className="pick";
  d.onclick=()=>pick(d);
  grid.appendChild(d);
}

function pick(el){
  if(el.classList.contains("sel")){
    el.classList.remove("sel");
    selected=selected.filter(x=>x!==el);
    return;
  }
  if(selected.length>=3) return;
  el.classList.add("sel");
  selected.push(el);
  if(selected.length===3) confirm.classList.remove("hidden");
}

goBtn.onclick=async()=>{
  document.getElementById("picker").remove();
  confirm.remove();
  await fireSequence();
};

async function fireSequence(){
  const targets=[...bigCards].map(c=>c.getBoundingClientRect());

  for(let i=0;i<3;i++){
    const fb=document.createElement("div");
    fb.className="fireball";
    document.body.appendChild(fb);

    const startX=window.innerWidth/2;
    const startY=window.innerHeight*0.75;
    const endX=targets[i].left+targets[i].width/2;
    const endY=targets[i].top+targets[i].height/2;

    fb.animate([
      {transform:`translate(${startX}px,${startY}px)`},
      {transform:`translate(${(startX+endX)/2}px,${startY-180}px)`},
      {transform:`translate(${endX}px,${endY}px)`}
    ],{duration:4200,easing:"ease-in-out",fill:"forwards"});

    await wait(600);
    setTimeout(()=>fb.remove(),4300);
  }

  await wait(4500);

  bigCards.forEach(c=>c.classList.add("burning"));
  await wait(2500);
  bigCards.forEach(c=>c.classList.add("smoke"));
  await wait(3000);

  bigCards.forEach((c,i)=>{
    const f=c.querySelector(".front");
    f.style.backgroundImage=`url('${draw78()}')`;
    f.style.display="block";
  });
}

function draw78(){
  const r=Math.random();
  if(r<22){
    return `/assets/tarot/majors/${String(Math.floor(Math.random()*22)).padStart(2,"0")}_the_fool.png`;
  }else{
    const suits=["cups","wands","swords","pentacles"];
    const suit=suits[Math.floor(Math.random()*4)];
    const num=String(Math.floor(Math.random()*14)+1).padStart(2,"0");
    return `/assets/tarot/minors/${suit}/${num}_ace.png`.replace("ace",nameMap[num]);
  }
}

const nameMap={
"01":"ace","02":"two","03":"three","04":"four","05":"five","06":"six","07":"seven",
"08":"eight","09":"nine","10":"ten","11":"page","12":"knight","13":"queen","14":"king"
};

const wait=ms=>new Promise(r=>setTimeout(r,ms));
