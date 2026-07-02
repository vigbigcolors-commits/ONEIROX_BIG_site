(function(){

  /* ── LUNAR MATH ─────────────────────────────────────────────────── */
  var SYN = 29.53058867;
  var NM0 = Date.UTC(2000,0,6,18,14,0);

  function age(date){ return (((date.getTime()-NM0)/86400000)%SYN+SYN)%SYN; }
  function illum(a){ return (1-Math.cos(2*Math.PI*a/SYN))/2; }

  /* ── PHASE DATA ─────────────────────────────────────────────────── */
  function phase(a){
    var il=illum(a), w=a<SYN/2;
    if(a<1.5||a>SYN-1.5) return {name:'New Moon',sym:'🌑',il:il,
      intensity:80,desc:'The brain enters its deepest available REM architecture. Profound but hard to hold on waking.',
      rem:'Deep & archetypal',emo:'Inward — low surface charge',recall:'Fragmented on waking',themes:'Voids, origins, descent',
      insight:'The New Moon pulls sleep into its deepest available architecture. REM cycles tend toward the archetypal — images drawn from the oldest vocabulary. Dreams here are harder to recall precisely because they operate below narrative: sensation, directionless knowing, the specific quality of something present before it has a name.'};
    if(a<7.38) return {name:'Waxing Crescent',sym:'🌒',il:il,
      intensity:52,desc:'Sleep stabilising. REM cycles forming with increasing coherence. Dreams beginning to acquire narrative.',
      rem:'Building coherence',emo:'Anticipatory, forward-leaning',recall:'Improving — snippets become scenes',themes:'Motion, approach, possibility',
      insight:'The Waxing Crescent produces dreams with a distinctive forward quality — something is approaching, something is being built toward. REM architecture is consolidating. The emotional register is anticipatory rather than resolved. Dreams during this phase tend to be about movement toward something not yet visible.'};
    if(a<8.38) return {name:'First Quarter',sym:'🌓',il:il,
      intensity:65,desc:'Tension between phases generates heightened cortisol. Dreams become vivid and decision-charged.',
      rem:'Vivid, decision-weighted',emo:'Tension — competing forces',recall:'Good — visual clarity high',themes:'Thresholds, decisions, conflict',
      insight:'The First Quarter — exactly half illuminated. This balance registers as heightened cortisol, which sharpens the vividness of dreams while introducing a quality of conflict. Dreams here often stage the classic threshold scenario: a decision that cannot be deferred, two paths visible, neither fully lit.'};
    if(a<13.77) return {name:'Waxing Gibbous',sym:'🌔',il:il,
      intensity:75,desc:'Lunar pull strengthening. REM density increasing. Dreams rich with unresolved emotional material.',
      rem:'Dense & emotionally loaded',emo:'Rising — pressure accumulating',recall:'Strong — sequences intact',themes:'Accumulation, pressure, unresolved matters',
      insight:'The Waxing Gibbous produces some of the most narratively complete dreams — sequences with a beginning, a sustained middle, and an ending that almost resolves. The specific quality of this phase is accumulation without release. Something is building. The dream senses it.'};
    if(a<15.77) return {name:'Full Moon',sym:'🌕',il:il,
      intensity:95,desc:'Peak lunar influence. Cajochen et al.: 30% less deep sleep, 25% more REM density. Maximum vividity.',
      rem:'Shortened deep sleep, maximum REM',emo:'Peak — everything amplified',recall:'Exceptional — cinematic detail',themes:'Confrontation, revelation, exposure',
      insight:'The Full Moon is documented in peer-reviewed sleep research as the phase of maximum REM disruption. Deep sleep shortens. REM cycles increase in density. The dreaming brain runs at its highest intensity. What you dreamed on this night was the clearest available signal from your subconscious.'};
    if(a<22.15) return {name:'Waning Gibbous',sym:'🌖',il:il,
      intensity:72,desc:'Post-peak processing. REM working through material activated at the Full Moon. Integration in progress.',
      rem:'Processing mode — integration',emo:'Releasing — tension beginning to resolve',recall:'Strong — emotional residue clear',themes:'Aftermath, processing, letting go',
      insight:'The Waning Gibbous is the brain\'s integration phase — the period after the Full Moon when REM works through what was surfaced. Dreams here have a distinctive processing quality: not the peak charge of the Full Moon, but the work of making sense of what the peak revealed.'};
    if(a<23.15) return {name:'Last Quarter',sym:'🌗',il:il,
      intensity:62,desc:'Second tension point. Equal light and shadow. Dreams stage what needs to be released before the cycle closes.',
      rem:'Reflective, review-oriented',emo:'Contemplative — equal weight on past',recall:'Moderate — more feeling than image',themes:'Release, completion, what to keep',
      insight:'The Last Quarter faces back where the First Quarter faced forward. Dreams carry a specific quality: the review of something that needs to be decided before it can be laid down. What from this cycle needs to be released? The dream is doing the accounting.'};
    return {name:'Waning Crescent',sym:'🌘',il:il,
      intensity:55,desc:'Lunar influence fading. Sleep deepening toward New Moon. Dreams quiet, sparse, often symbolic.',
      rem:'Quieting — depth returning',emo:'Low and inward — rest before reset',recall:'Sparse on waking',themes:'Completion, fading, the space before',
      insight:'The Waning Crescent is the lunar cycle\'s exhale. The dream mind is quieting. What appears here tends to be sparse and symbolic — the residue of the cycle. Images arriving now are the ones that have been waiting for the quiet. Small, specific, carrying weight disproportionate to their size.'};
  }

  /* ── SVG MOON ───────────────────────────────────────────────────── */
  function drawMoon(a, el){
    var il=illum(a), wax=a<SYN/2, pct=Math.round(il*100);
    var NS='http://www.w3.org/2000/svg', r=30,cx=36,cy=36;
    el.innerHTML='';
    var d=document.createElementNS(NS,'defs');
    var cp=document.createElementNS(NS,'clipPath'); cp.setAttribute('id','dc'+Date.now()%1000);
    var cc=document.createElementNS(NS,'circle'); cc.setAttribute('cx',cx); cc.setAttribute('cy',cy); cc.setAttribute('r',r);
    cp.appendChild(cc); d.appendChild(cp); el.appendChild(d);
    var cpId=cp.id;
    var g=document.createElementNS(NS,'g'); g.setAttribute('clip-path','url(#'+cpId+')');
    var bg=document.createElementNS(NS,'rect'); bg.setAttribute('x',0); bg.setAttribute('y',0); bg.setAttribute('width',72); bg.setAttribute('height',72); bg.setAttribute('fill','#d0c8bc'); g.appendChild(bg);
    var lit=document.createElementNS(NS,'rect');
    if(wax){lit.setAttribute('x',cx);lit.setAttribute('y',0);lit.setAttribute('width',r);lit.setAttribute('height',72);}
    else{lit.setAttribute('x',0);lit.setAttribute('y',0);lit.setAttribute('width',r);lit.setAttribute('height',72);}
    lit.setAttribute('fill','#ece4d4'); g.appendChild(lit);
    if(pct>3&&pct<97){
      var rx=wax?r*(1-2*il):r*(2*il-1);
      var sh=document.createElementNS(NS,'ellipse');
      sh.setAttribute('cx',cx);sh.setAttribute('cy',cy);sh.setAttribute('rx',Math.max(1,Math.abs(rx)));sh.setAttribute('ry',r);
      var fc=wax?(il<=0.5?'#d0c8bc':'#ece4d4'):(il>=0.5?'#d0c8bc':'#ece4d4');
      sh.setAttribute('fill',fc); g.appendChild(sh);
    }
    if(pct<=3){var f=document.createElementNS(NS,'rect');f.setAttribute('x',0);f.setAttribute('y',0);f.setAttribute('width',72);f.setAttribute('height',72);f.setAttribute('fill','#c0b8b0');g.appendChild(f);}
    // Craters in SVG
    [[22,26,5],[44,20,3],[30,52,4],[54,40,3],[18,60,3]].forEach(function(c){
      var cr=document.createElementNS(NS,'circle');
      cr.setAttribute('cx',c[0]);cr.setAttribute('cy',c[1]);cr.setAttribute('r',c[2]);
      cr.setAttribute('fill','rgba(0,0,0,0.07)');cr.setAttribute('stroke','rgba(0,0,0,0.04)');cr.setAttribute('stroke-width','0.5');
      g.appendChild(cr);
    });
    el.appendChild(g);
    var bo=document.createElementNS(NS,'circle');bo.setAttribute('cx',cx);bo.setAttribute('cy',cy);bo.setAttribute('r',r);bo.setAttribute('fill','none');bo.setAttribute('stroke','rgba(200,192,180,0.4)');bo.setAttribute('stroke-width','1');el.appendChild(bo);
  }

  /* ── NEXT PHASES ────────────────────────────────────────────────── */
  function next4(date){
    var a=age(date);
    return [{n:'New Moon',s:'🌑',t:0},{n:'First Quarter',s:'🌓',t:7.38},{n:'Full Moon',s:'🌕',t:14.77},{n:'Last Quarter',s:'🌗',t:22.15}]
    .map(function(p){
      var d=p.t-a; if(d<=0.5)d+=SYN; if(d>SYN)d-=SYN;
      return {name:p.n,sym:p.s,date:new Date(date.getTime()+d*86400000),days:Math.round(d)};
    }).sort(function(a,b){return a.days-b.days;}).slice(0,4);
  }

  function fmt(d){var m=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];return m[d.getMonth()]+' '+d.getDate()+', '+d.getFullYear();}
  function fmtLong(d){var m=['January','February','March','April','May','June','July','August','September','October','November','December'];return m[d.getMonth()]+' '+d.getDate()+', '+d.getFullYear();}

  /* ── PAUSE ANIMATIONS WHEN OFF-SCREEN ──────────────────────────── */
  var root = document.getElementById('dpc3-root');
  if('IntersectionObserver' in window && root){
    var perfIO = new IntersectionObserver(function(entries){
      entries.forEach(function(e){
        if(e.isIntersecting){
          root.classList.remove('dpc3-paused');
        } else {
          root.classList.add('dpc3-paused');
        }
      });
    }, { rootMargin: '100px' });
    perfIO.observe(root);
  }

  /* Stars are now CSS background-image — no JS loop needed */

  /* ── TOAST ──────────────────────────────────────────────────────── */
  var toastTimer;
  function toast(msg, dur){
    var t=document.getElementById('dpc3-toast');
    t.textContent=msg; t.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer=setTimeout(function(){ t.classList.remove('show'); }, dur||2800);
  }

  /* ── EASTER EGGS ────────────────────────────────────────────────── */
  var clicks=0;
  var eggs=[
    '🌕 The ancients tracked this too. Babylonian dream tablets, 3000 BCE.',
    '🌑 Even in the new moon\'s darkness, the amygdala dreams at full volume.',
    '✦ You\'ve been watching the moon. It has been watching back.',
    '🔭 Galileo charted these craters in 1609. Tonight, your brain charted its own.',
    '◆ Oneirox · Where neuroscience meets the night.',
  ];
  document.getElementById('dpc3-moon-teaser').addEventListener('click',function(){
    this.classList.add('pulse');
    var self=this; setTimeout(function(){self.classList.remove('pulse');},600);
    toast(eggs[clicks%eggs.length]);
    clicks++;
    // Animate cycle dots
    var dots=document.querySelectorAll('.dpc3-cycle-dot');
    dots.forEach(function(d,i){ d.classList.remove('active'); });
    dots[clicks%dots.length].classList.add('active');
  });

  /* ── CALCULATE ──────────────────────────────────────────────────── */
  var lastDate, lastPhase;

  function calculate(){
    var val=document.getElementById('dpc3-date').value; if(!val) return;
    var p=val.split('-');
    var date=new Date(parseInt(p[0]),parseInt(p[1])-1,parseInt(p[2]),12,0,0);
    lastDate=date;
    var a=age(date), data=phase(a), pct=Math.round(data.il*100);
    lastPhase=data;

    drawMoon(a, document.getElementById('dpc3-result-svg'));
    document.getElementById('dpc3-pname').textContent=data.name;
    document.getElementById('dpc3-age').textContent='Day '+Math.round(a)+' of 29.5 — lunar cycle';
    document.getElementById('dpc3-datef').textContent=fmtLong(date);
    document.getElementById('dpc3-illum').textContent=pct+'% illuminated';

    var bar=document.getElementById('dpc3-bar');
    bar.style.width='0%';
    setTimeout(function(){bar.style.width=data.intensity+'%';},80);
    document.getElementById('dpc3-pct').textContent=data.intensity+'%';
    document.getElementById('dpc3-desc').textContent=data.desc;
    document.getElementById('dpc3-rem').textContent=data.rem;
    document.getElementById('dpc3-emo').textContent=data.emo;
    document.getElementById('dpc3-recall').textContent=data.recall;
    document.getElementById('dpc3-themes').textContent=data.themes;
    document.getElementById('dpc3-insight').textContent=data.insight;

    var nl=document.getElementById('dpc3-next'); nl.innerHTML='';
    next4(date).forEach(function(ph){
      var dl=ph.days===0?'today':ph.days===1?'tomorrow':'in '+ph.days+' days';
      var el=document.createElement('div'); el.className='dpc3-next-item';
      el.innerHTML='<div class="dpc3-next-sym">'+ph.sym+'</div><div class="dpc3-next-info"><div class="dpc3-next-name">'+ph.name+'</div><div class="dpc3-next-date">'+fmt(ph.date)+'</div></div><div class="dpc3-next-days">'+dl+'</div>';
      nl.appendChild(el);
    });

    // Share URLs
    var shareText='My dream on '+fmt(date)+' happened during the '+data.name+' — '+data.intensity+'% dream intensity. Find out what the moon was doing when you dreamed:';
    var shareUrl='https://oneirox.com/phase/';
    document.getElementById('dpc3-sx').href='https://twitter.com/intent/tweet?text='+encodeURIComponent(shareText)+'&url='+encodeURIComponent(shareUrl);
    document.getElementById('dpc3-sr').href='https://reddit.com/submit?url='+encodeURIComponent(shareUrl)+'&title='+encodeURIComponent(shareText);
    document.getElementById('dpc3-sq').href='https://www.quora.com/share?url='+encodeURIComponent(shareUrl);

    document.getElementById('dpc3-result').style.display='block';

    // Special easter egg for Full Moon
    if(data.intensity>=90){
      setTimeout(function(){ toast('🌕 Full Moon detected. The Cajochen study was built on nights exactly like this one.', 3500); },600);
    }
  }

  /* ── COPY LINK ──────────────────────────────────────────────────── */
  document.getElementById('dpc3-cp').addEventListener('click',function(){
    var url='https://oneirox.com/phase/';
    if(navigator.clipboard){
      navigator.clipboard.writeText(url).then(function(){
        var tip=document.getElementById('dpc3-ctip');
        tip.classList.add('show');
        setTimeout(function(){tip.classList.remove('show');},2000);
      });
    }
  });

  /* ── OPEN / CLOSE ───────────────────────────────────────────────── */
  document.getElementById('dpc3-open').addEventListener('click',function(){
    var panel=document.getElementById('dpc3-panel');
    panel.classList.add('open');
    calculate();
    setTimeout(function(){ panel.scrollIntoView({behavior:'smooth',block:'nearest'}); },60);
  });

  document.getElementById('dpc3-close').addEventListener('click',function(){
    document.getElementById('dpc3-panel').classList.remove('open');
  });

  /* ── CALCULATE BUTTON ───────────────────────────────────────────── */
  document.getElementById('dpc3-calc').addEventListener('click', calculate);
  document.getElementById('dpc3-date').addEventListener('keydown',function(e){if(e.key==='Enter')calculate();});

  /* ── DEFAULT DATE = TODAY ───────────────────────────────────────── */
  var t=new Date();
  document.getElementById('dpc3-date').value=t.getFullYear()+'-'+String(t.getMonth()+1).padStart(2,'0')+'-'+String(t.getDate()).padStart(2,'0');

  /* Dedicated /phase/ page — open calculator immediately */
  if (/\/phase\/?$/.test(window.location.pathname)) {
    var panel=document.getElementById('dpc3-panel');
    if (panel) {
      panel.classList.add('open');
      calculate();
    }
  }

}());