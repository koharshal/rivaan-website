(function(){
  /* run the full motion experience for every visitor */
  var reduce = false;

  /* the fonts stylesheet is preloaded; apply it as soon as the document is parsed */
  var fonts=document.getElementById('fonts');
  if(fonts) fonts.media='all';
  var DPR = Math.min(window.devicePixelRatio || 1, 2);
  var CORAL='#FF7759', INDIGO='#4B57D9';

  /* progress bar */
  var prog=document.getElementById('progress');
  function onScroll(){var h=document.documentElement;var p=h.scrollTop/(h.scrollHeight-h.clientHeight||1);prog.style.transform='scaleX('+p+')';}
  addEventListener('scroll',onScroll,{passive:true});onScroll();

  /* reveal: hide only what starts below the first screen */
  if(!reduce && 'IntersectionObserver' in window){
    var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.remove('pre');io.unobserve(e.target);}});},{rootMargin:'0px 0px -8% 0px'});
    var vh=innerHeight;
    document.querySelectorAll('.rv').forEach(function(el,i){
      if(el.getBoundingClientRect().top>vh){el.classList.add('pre');el.style.transitionDelay=((i%3)*70)+'ms';io.observe(el);}
    });
    var play=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('play');play.unobserve(e.target);}});},{rootMargin:'0px 0px -15% 0px'});
    ['chart','next'].forEach(function(id){var el=document.getElementById(id);if(el&&el.getBoundingClientRect().top>vh)play.observe(el);else if(el)el.classList.add('play');});
    document.querySelectorAll('.case').forEach(function(el){play.observe(el);});
    var d50=document.getElementById('d50');
    var dio=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){setTimeout(function(){d50.classList.add('found');},900);dio.disconnect();}});},{threshold:.5});
    dio.observe(d50);
  } else {
    var d=document.getElementById('d50'); if(d) d.classList.add('found');
    document.querySelectorAll('.nx').forEach(function(n){n.style.setProperty('--p',1)});
  }

  /* spotlight cards */
  document.querySelectorAll('.spot').forEach(function(el){
    el.addEventListener('pointermove',function(e){var r=el.getBoundingClientRect();el.style.setProperty('--mx',(e.clientX-r.left)+'px');el.style.setProperty('--my',(e.clientY-r.top)+'px');});
  });

  /* copy */
  var btn=document.getElementById('copy');
  btn.addEventListener('click',function(){
    var t=document.getElementById('email').textContent;
    function done(){btn.textContent='Copied';setTimeout(function(){btn.textContent='Copy';},1600);}
    function fallback(){var r=document.createRange();r.selectNodeContents(document.getElementById('email'));var s=getSelection();s.removeAllRanges();s.addRange(r);btn.textContent='Selected';}
    try{navigator.clipboard.writeText(t).then(done,fallback);}catch(e){fallback();}
  });

  function fitCanvas(c){var r=c.getBoundingClientRect();var w=Math.max(1,Math.round(r.width*DPR)),h=Math.max(1,Math.round(r.height*DPR));if(c.width!==w||c.height!==h){c.width=w;c.height=h;}return {w:r.width,h:r.height};}
  function visibleLoop(el,step){
    var on=true,raf=0;
    function frame(t){step(t);if(on&&!reduce)raf=requestAnimationFrame(frame);}
    if('IntersectionObserver' in window){new IntersectionObserver(function(es){var v=es[0].isIntersecting;if(v&&!on){on=true;raf=requestAnimationFrame(frame);}else if(!v){on=false;cancelAnimationFrame(raf);}}).observe(el);}
    raf=requestAnimationFrame(frame);
  }

  /* ---------- globe ---------- */
  (function(){
    var c=document.getElementById('globe'); if(!c) return;
    var ctx=c.getContext('2d');
    var rad=Math.PI/180;
    function vec(lat,lon){lat*=rad;lon*=rad;return [Math.cos(lat)*Math.sin(lon),Math.sin(lat),Math.cos(lat)*Math.cos(lon)];}
    var N=900,pts=[];var ga=Math.PI*(3-Math.sqrt(5));
    for(var i=0;i<N;i++){var y=1-(i/(N-1))*2,r=Math.sqrt(1-y*y),th=ga*i;pts.push([Math.cos(th)*r,y,Math.sin(th)*r]);}
    var INDIA=vec(21,78.5);
    var MARKETS=[['Germany',51,10],['United Kingdom',54,-2],['Netherlands',52.2,5.3],['Belgium',50.6,4.5],['France',46.5,2.3],['Sweden',62,15],['Italy',42.8,12.5],['Poland',52,19.5],['Spain',40.2,-3.7],['UAE',24.3,54.4],['United States',39,-98],['Kenya',-0.02,37.9],['South Africa',-30.56,22.94]];
    MARKETS=MARKETS.map(function(m){return {name:m[0],v:vec(m[1],m[2])};});
    var arcs=[],lastSpawn=-9999,next=0,t0=performance.now();
    function slerp(a,b,t){var d=Math.acos(Math.max(-1,Math.min(1,a[0]*b[0]+a[1]*b[1]+a[2]*b[2])));if(d<1e-4)return a;var s=Math.sin(d),k1=Math.sin((1-t)*d)/s,k2=Math.sin(t*d)/s;return [a[0]*k1+b[0]*k2,a[1]*k1+b[1]*k2,a[2]*k1+b[2]*k2];}
    var order=[0,9,11,1,4,12,10,6,2,7,3,8,5];
    function draw(now){
      var s=fitCanvas(c),W=s.w,H=s.h;ctx.setTransform(DPR,0,0,DPR,0,0);ctx.clearRect(0,0,W,H);
      var t=(now-t0)/1000;
      var R=Math.min(W,H)*0.40,cx=W*0.5,cy=H*0.52;
      var front=(reduce?52:52+16*Math.sin(t*0.1))*rad, tilt=0.42;
      var ca=Math.cos(-front),sa=Math.sin(-front),cb=Math.cos(tilt),sb=Math.sin(tilt);
      function P(v){var x1=v[0]*ca+v[2]*sa,z1=-v[0]*sa+v[2]*ca,y1=v[1];var y2=y1*cb-z1*sb,z2=y1*sb+z1*cb;return [cx+x1*R,cy-y2*R,z2];}
      // halo
      var g=ctx.createRadialGradient(cx,cy,R*0.2,cx,cy,R*1.35);g.addColorStop(0,'rgba(75,87,217,0.16)');g.addColorStop(0.7,'rgba(75,87,217,0.05)');g.addColorStop(1,'rgba(21,23,58,0)');ctx.fillStyle=g;ctx.beginPath();ctx.arc(cx,cy,R*1.35,0,7);ctx.fill();
      ctx.strokeStyle='rgba(169,176,244,0.18)';ctx.lineWidth=1;ctx.beginPath();ctx.arc(cx,cy,R,0,7);ctx.stroke();
      // graticule
      ctx.lineWidth=0.8;ctx.strokeStyle='rgba(169,176,244,0.10)';
      for(var lo=0;lo<180;lo+=30){ctx.beginPath();var pen=false;for(var la2=-90;la2<=270;la2+=4){var ll=la2<=90?la2:180-la2,lon2=la2<=90?lo:lo+180;var q3=P(vec(ll,lon2));if(q3[2]>0){if(!pen){ctx.moveTo(q3[0],q3[1]);pen=true;}else ctx.lineTo(q3[0],q3[1]);}else pen=false;}ctx.stroke();}
      for(var pa=-60;pa<=60;pa+=30){ctx.beginPath();var pen2=false;for(var lo3=0;lo3<=360;lo3+=4){var q4=P(vec(pa,lo3));if(q4[2]>0){if(!pen2){ctx.moveTo(q4[0],q4[1]);pen2=true;}else ctx.lineTo(q4[0],q4[1]);}else pen2=false;}ctx.stroke();}
      // dots
      for(var i=0;i<N;i++){var p=P(pts[i]);if(p[2]<-0.05){continue;}var a=0.16+0.7*Math.max(0,p[2]);ctx.fillStyle='rgba(189,192,224,'+a.toFixed(3)+')';var rr=0.7+1.1*Math.max(0,p[2]);ctx.fillRect(p[0]-rr/2,p[1]-rr/2,rr,rr);}
      // spawn
      if(!reduce&&now-lastSpawn>1100){
        for(var k=0;k<order.length;k++){var m=MARKETS[order[next%order.length]];next++;var pz=P(m.v)[2];if(pz>0.08){arcs.push({m:m,born:now});lastSpawn=now;break;}}
      }
      if(reduce&&arcs.length===0){[0,1,9,4,6].forEach(function(ix){arcs.push({m:MARKETS[ix],born:-1e9});});}
      // arcs
      var ip=P(INDIA);
      arcs=arcs.filter(function(a){return reduce || now-a.born<5200;});
      arcs.forEach(function(a){
        var age=reduce?2.5:(now-a.born)/1000,dur=1.5,prog=Math.min(1,age/dur),fade=reduce?1:Math.max(0,1-Math.max(0,age-3.2)/2);
        var dd=Math.acos(Math.max(-1,Math.min(1,INDIA[0]*a.m.v[0]+INDIA[1]*a.m.v[1]+INDIA[2]*a.m.v[2])));
        var lift=0.12+0.55*dd/Math.PI*2;
        var steps=48,pts2=[];
        for(var j=0;j<=steps;j++){var tt=j/steps;var v=slerp(INDIA,a.m.v,tt);var h=1+lift*Math.sin(Math.PI*tt);pts2.push(P([v[0]*h,v[1]*h,v[2]*h]));}
        var end=Math.max(1,Math.floor(prog*steps));
        ctx.lineWidth=1.8;ctx.lineCap='round';
        for(var j2=1;j2<=end;j2++){var q0=pts2[j2-1],q1=pts2[j2];if(q1[2]<-0.15)continue;var alpha=fade*(0.25+0.75*(j2/end));ctx.strokeStyle='rgba(255,119,89,'+alpha.toFixed(3)+')';ctx.beginPath();ctx.moveTo(q0[0],q0[1]);ctx.lineTo(q1[0],q1[1]);ctx.stroke();}
        var head=pts2[end];
        if(prog<1){ctx.fillStyle='rgba(255,220,210,'+fade+')';ctx.beginPath();ctx.arc(head[0],head[1],2.6,0,7);ctx.fill();}
        else{
          var tp=P(a.m.v);var since=reduce?1:age-dur;var ring=6+since*22;var ra=Math.max(0,1-since/1.6)*fade;
          ctx.strokeStyle='rgba(255,119,89,'+ra.toFixed(3)+')';ctx.lineWidth=1.5;ctx.beginPath();ctx.arc(tp[0],tp[1],ring,0,7);ctx.stroke();
          ctx.fillStyle='rgba(245,244,240,'+fade+')';ctx.beginPath();ctx.arc(tp[0],tp[1],3.6,0,7);ctx.fill();
          var la=Math.min(1,since*2)*fade;
          if(la>0.02&&tp[2]>0){ctx.font='500 12px "IBM Plex Sans", Arial, sans-serif';var label=a.m.name;var tw=ctx.measureText(label).width;var bx=tp[0]+10,by=tp[1]-26;
            if(bx+tw+18>W)bx=tp[0]-tw-28;
            ctx.globalAlpha=la;ctx.fillStyle='rgba(35,38,90,0.92)';roundRect(ctx,bx,by,tw+18,22,11);ctx.fill();ctx.strokeStyle='rgba(255,119,89,0.6)';ctx.lineWidth=1;ctx.stroke();ctx.fillStyle='#F5F4F0';ctx.fillText(label,bx+9,by+15);ctx.globalAlpha=1;}
        }
      });
      // India
      if(ip[2]>-0.1){var pulse=reduce?0.5:(t%2)/2;ctx.fillStyle='rgba(255,119,89,'+(0.35*(1-pulse)).toFixed(3)+')';ctx.beginPath();ctx.arc(ip[0],ip[1],8+pulse*22,0,7);ctx.fill();ctx.fillStyle=CORAL;ctx.beginPath();ctx.arc(ip[0],ip[1],6,0,7);ctx.fill();ctx.fillStyle='#15173A';ctx.beginPath();ctx.arc(ip[0],ip[1],2.2,0,7);ctx.fill();}
    }
    function roundRect(x,a,b,w,h,r){x.beginPath();x.moveTo(a+r,b);x.arcTo(a+w,b,a+w,b+h,r);x.arcTo(a+w,b+h,a,b+h,r);x.arcTo(a,b+h,a,b,r);x.arcTo(a,b,a+w,b,r);x.closePath();}
    visibleLoop(c,draw);
    if(reduce) addEventListener('resize',function(){draw(performance.now());});
  })();

  /* ---------- funnel ---------- */
  (function(){
    var c=document.getElementById('funnel'); if(!c) return;
    var ctx=c.getContext('2d');var parts=[];var last=performance.now();
    var gates=[0.2,0.4,0.6,0.8],keep=[0.45,0.5,0.45,0.5];
    function spread(x){var e=Math.min(1,x/0.92);e=e*e*(3-2*e);return 1-0.97*e;}
    function mix(a,b,t){return Math.round(a+(b-a)*t);}
    function col(x,al){return 'rgba('+mix(75,255,x)+','+mix(87,119,x)+','+mix(217,89,x)+','+al.toFixed(3)+')';}
    function spawn(x){var p={x:x,y:Math.random()*2-1,v:0.07+Math.random()*0.05,dead:-1,g:0,j:(Math.random()-.5)*0.4};for(var i=0;i<gates.length;i++){if(gates[i]<x){if(Math.random()>keep[i]){p.dead=-2;}}}return p;}
    for(var i=0;i<380;i++){var p=spawn(Math.random());if(p.dead!==-2)parts.push(p);}
    var hits=0,flash=0;
    function draw(now){
      var s=fitCanvas(c),W=s.w,H=s.h;ctx.setTransform(DPR,0,0,DPR,0,0);ctx.clearRect(0,0,W,H);
      var dt=Math.min(0.05,(now-last)/1000);last=now;if(reduce)dt=0;
      var L=24,Rr=W-40,cy=H*0.44,half=H*0.36;
      // gate lines
      ctx.setLineDash([3,6]);ctx.strokeStyle='rgba(135,138,156,0.35)';ctx.lineWidth=1;
      gates.forEach(function(g){var x=L+(Rr-L)*g;var hh=half*spread(g)+10;ctx.beginPath();ctx.moveTo(x,cy-hh);ctx.lineTo(x,cy+hh);ctx.stroke();});
      ctx.setLineDash([]);
      // envelope
      ctx.beginPath();for(var k=0;k<=60;k++){var gx=k/60;ctx.lineTo(L+(Rr-L)*gx,cy-half*spread(gx)-6);}for(var k2=60;k2>=0;k2--){var gx2=k2/60;ctx.lineTo(L+(Rr-L)*gx2,cy+half*spread(gx2)+6);}ctx.closePath();ctx.fillStyle='rgba(75,87,217,0.05)';ctx.fill();
      if(!reduce&&Math.random()<0.9){for(var q=0;q<3;q++)parts.push({x:0,y:Math.random()*2-1,v:0.07+Math.random()*0.05,dead:-1,g:0,j:(Math.random()-.5)*0.4});}
      for(var i=parts.length-1;i>=0;i--){var p=parts[i];
        if(p.dead>=0){p.dead+=dt;p.y+=p.j*dt*3;if(p.dead>0.6){parts.splice(i,1);continue;}}
        else{var nx=p.x+p.v*dt;for(var gi=0;gi<gates.length;gi++){if(p.x<gates[gi]&&nx>=gates[gi]&&Math.random()>keep[gi]){p.dead=0;}}p.x=nx;
          if(p.x>=1){parts.splice(i,1);hits++;flash=1;continue;}}
        var X=L+(Rr-L)*p.x,Y=cy+p.y*half*spread(p.x);
        var al=p.dead>=0?Math.max(0,0.5-p.dead):(0.35+0.6*p.x);
        var r=p.dead>=0?1.6:1.6+1.6*p.x;
        ctx.fillStyle=p.dead>=0?'rgba(135,138,156,'+al.toFixed(3)+')':col(p.x,al);
        ctx.beginPath();ctx.arc(X,Y,r,0,7);ctx.fill();
      }
      flash=Math.max(0,flash-dt*1.6);
      var ex=Rr+12;
      ctx.fillStyle='rgba(255,119,89,'+(0.18+0.25*flash).toFixed(3)+')';ctx.beginPath();ctx.arc(ex,cy,14+10*flash,0,7);ctx.fill();
      ctx.fillStyle=CORAL;ctx.beginPath();ctx.arc(ex,cy,8,0,7);ctx.fill();
      // step numbers
      ctx.font='600 12px "IBM Plex Sans", Arial, sans-serif';ctx.textAlign='center';ctx.fillStyle='rgba(82,85,107,0.9)';
      if(W>560){[0.1,0.3,0.5,0.7,0.9].forEach(function(x,i){ctx.fillText(String(i+1),L+(Rr-L)*x,16);});}
      ctx.textAlign='start';
    }
    visibleLoop(c,draw);
    if(reduce) addEventListener('resize',function(){draw(performance.now());});
  })();

  /* ---------- closing routes ---------- */
  (function(){
    var c=document.getElementById('routes'); if(!c) return;
    var ctx=c.getContext('2d');var seeds=[];for(var i=0;i<9;i++)seeds.push({a:Math.random()*Math.PI*0.9-Math.PI*0.45,len:0.45+Math.random()*0.5,sp:0.12+Math.random()*0.12,off:Math.random(),c:i%3===0?INDIGO:CORAL});
    function draw(now){
      var s=fitCanvas(c),W=s.w,H=s.h;ctx.setTransform(DPR,0,0,DPR,0,0);ctx.clearRect(0,0,W,H);
      var ox=W*0.92,oy=H*0.82,t=now/1000;
      var g=ctx.createRadialGradient(ox,oy,0,ox,oy,W*0.5);g.addColorStop(0,'rgba(226,85,59,0.22)');g.addColorStop(1,'rgba(21,23,58,0)');ctx.fillStyle=g;ctx.fillRect(0,0,W,H);
      seeds.forEach(function(sd){
        var ang=Math.PI+sd.a;var L=Math.max(W,H)*sd.len;var ex=ox+Math.cos(ang)*L,ey=oy+Math.sin(ang)*L*0.7-L*0.25;
        var mx=(ox+ex)/2,my=Math.min(oy,ey)-L*0.35;
        ctx.strokeStyle=sd.c===CORAL?'rgba(255,119,89,0.22)':'rgba(75,87,217,0.35)';ctx.lineWidth=1.2;ctx.beginPath();ctx.moveTo(ox,oy);ctx.quadraticCurveTo(mx,my,ex,ey);ctx.stroke();
        var u=reduce?0.6:((t*sd.sp+sd.off)%1);var x=(1-u)*(1-u)*ox+2*(1-u)*u*mx+u*u*ex,y=(1-u)*(1-u)*oy+2*(1-u)*u*my+u*u*ey;
        ctx.fillStyle=sd.c===CORAL?'rgba(255,170,150,0.9)':'rgba(169,176,244,0.9)';ctx.beginPath();ctx.arc(x,y,2.4,0,7);ctx.fill();
        ctx.fillStyle='rgba(245,244,240,0.55)';ctx.beginPath();ctx.arc(ex,ey,2.6,0,7);ctx.fill();
      });
      ctx.fillStyle=CORAL;ctx.beginPath();ctx.arc(ox,oy,6,0,7);ctx.fill();
    }
    visibleLoop(c,draw);
  })();
})();
