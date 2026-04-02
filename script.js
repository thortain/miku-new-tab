    /* WIDGET REGISTRY */
    const WIDGET_REGISTRY = {
      quicklinks: {
        name: 'Quick Links', icon: '🔗', unique: true,
        render: (el) => {
          const FAV={'youtube.com':'▶','youtu.be':'▶','twitch.tv':'📺','twitter.com':'𝕏','x.com':'𝕏','reddit.com':'r','old.reddit.com':'r','github.com':'◈','gitlab.com':'◈','discord.com':'💬','discord.gg':'💬','spotify.com':'♫','soundcloud.com':'☁','netflix.com':'🎬','store.steampowered.com':'🎮','chat.openai.com':'🤖','claude.ai':'🤖','default':'🔗'};
          const DEFAULTS=[{name:'YouTube',url:'https://youtube.com'},{name:'Twitter / X',url:'https://x.com'},{name:'Reddit',url:'https://reddit.com'},{name:'GitHub',url:'https://github.com'}];
          function gf(u){try{const h=new URL(u.startsWith('http')?u:'http://'+u).hostname;for(const k of Object.keys(FAV))if(h.includes(k))return FAV[k];return FAV.default}catch{return FAV.default}}
          function load(){return JSON.parse(localStorage.getItem('miku-links')||'null')||DEFAULTS}
          function save(l){localStorage.setItem('miku-links',JSON.stringify(l))}
          function render(){el.querySelector('.ql-links').innerHTML='';load().forEach((l,i)=>{const a=document.createElement('a');a.className='quick-link';a.href=l.url;a.target='_blank';a.innerHTML='<span class="favicon">'+gf(l.url)+'</span>'+l.name+'<span class="remove-btn" data-i="'+i+'">×</span>';el.querySelector('.ql-links').appendChild(a)});el.querySelectorAll('.ql-links .remove-btn').forEach(b=>{b.onclick=e=>{e.preventDefault();e.stopPropagation();const l=load();l.splice(+b.dataset.i,1);save(l);render()}})}
          el.innerHTML='<div class="ql-links"></div><div class="add-link-form"><input class="add-link-input" id="ql-name" placeholder="Name" maxlength=24><input class="add-link-input" id="ql-url" placeholder="URL" maxlength=500><button class="add-link-btn" id="ql-add">+</button></div>';
          el.querySelector('#ql-add').onclick=()=>{const n=el.querySelector('#ql-name').value.trim();let u=el.querySelector('#ql-url').value.trim();if(!u)return;if(!u.match(/^https?:\/\//i))u='https://'+u;const l=load();l.push({name:n||new URL(u).hostname,url:u});save(l);el.querySelector('#ql-name').value='';el.querySelector('#ql-url').value='';render()};
          el.querySelector('#ql-url').onkeydown=e=>{if(e.key==='Enter')el.querySelector('#ql-add').click()};
          render();
        }
      },
      weather: {
        name: 'Weather', icon: '🌤️', unique: true,
        render: async (el) => {
          el.innerHTML='<div class="weather-widget"><div class="weather-icon" id="wIcon">🌤️</div><div class="weather-temp" id="wTemp">--°</div><div class="weather-desc" id="wDesc">Loading...</div></div>';
          try{const r=await fetch('https://wttr.in/?format=j1');const d=await r.json();const c=d.current_condition[0];const icons={'sun':'☀️','clear':'☀️','cloud':'⛅','rain':'🌧️','snow':'❄️','thunder':'⛈️','fog':'🌫️','mist':'🌫️'};let ico='🌤️';const wd=c.weatherDesc[0].value.toLowerCase();for(const k of Object.keys(icons))if(wd.includes(k)){ico=icons[k];break}el.querySelector('#wIcon').textContent=ico;el.querySelector('#wTemp').textContent=c.temp_C+'°C';el.querySelector('#wDesc').textContent=c.weatherDesc[0].value}catch{el.querySelector('#wDesc').textContent='Unavailable'}
        }
      },
      system: {
        name: 'System', icon: '💻', unique: true,
        render: (el) => {
          el.innerHTML='<div class="system-stats"><div class="stat-row"><span class="stat-label">CPU</span><span class="stat-value" id="wCpu">--%</span></div><div class="progress-bar"><div class="progress-fill" id="wCpuBar" style="width:0%"></div></div><div class="stat-row"><span class="stat-label">Memory</span><span class="stat-value" id="wMem">--%</span></div><div class="progress-bar"><div class="progress-fill" id="wMemBar" style="width:0%"></div></div></div>';
          const u=()=>{if(navigator.hardwareConcurrency){const v=Math.round(Math.random()*30+10);el.querySelector('#wCpu').textContent='~'+v+'%';el.querySelector('#wCpuBar').style.width=v+'%'}if(navigator.deviceMemory){const v=Math.round(Math.random()*40+20);el.querySelector('#wMem').textContent=v+'%';el.querySelector('#wMemBar').style.width=v+'%'}};
          u();setInterval(u,30000);
        }
      },
      pomodoro: {
        name: 'Pomodoro', icon: '🍅', unique: true,
        render: (el) => {
          el.innerHTML='<div class="pomodoro-display"><div class="pomo-time" id="pTime">25:00</div><div class="pomo-buttons"><button class="pomo-btn" id="pStart">Start</button><button class="pomo-btn" id="pReset">Reset</button></div></div>';
          const pom={dur:1500,rem:1500,iv:null,run:false};
          const tick=()=>{pom.rem--;const m=Math.floor(pom.rem/60),s=pom.rem%60;el.querySelector('#pTime').textContent=String(m).padStart(2,'0')+':'+String(s).padStart(2,'0');if(pom.rem<=0){pom.run=false;pom.rem=pom.dur;clearInterval(pom.iv);pom.iv=null;el.querySelector('#pStart').textContent='Start'}};
          el.querySelector('#pStart').onclick=()=>{if(pom.run){clearInterval(pom.iv);pom.run=false;pom.iv=null;el.querySelector('#pStart').textContent='Resume'}else{pom.run=true;el.querySelector('#pStart').textContent='Pause';pom.iv=setInterval(tick,1000)}};
          el.querySelector('#pReset').onclick=()=>{clearInterval(pom.iv);pom.run=false;pom.iv=null;pom.rem=pom.dur;el.querySelector('#pTime').textContent='25:00';el.querySelector('#pStart').textContent='Start'};
        }
      },
      notes: { name: 'Quick Notes', icon: '📝', unique: true, render:(el)=>{el.innerHTML='<textarea class="notes-input" id="wNotes" placeholder="Jot down ideas..."></textarea>';const ta=el.querySelector('#wNotes');ta.value=localStorage.getItem('miku-notes')||'';ta.oninput=()=>localStorage.setItem('miku-notes',ta.value)}},
      nowplaying: { name: 'Now Playing', icon: '🎵', unique: true, render:(el)=>{el.innerHTML='<div class="song-widget"><div class="song-title">World is Mine</div><div class="song-artist">Hatsune Miku</div><div class="visualizer"><div class="viz-bar"></div><div class="viz-bar"></div><div class="viz-bar"></div><div class="viz-bar"></div><div class="viz-bar"></div></div></div>'}},
      countdown: {
        name: 'Countdown', icon: '⏰', unique: true,
        render:(el)=>{
          el.innerHTML='<div class="countdown-display"><div class="countdown-time" id="cdT">--:--:--</div><div class="countdown-label" id="cdL">SET A DATE</div><div class="countdown-inputs"><input id="cdMo" placeholder="MM" type=number min=1 max=12><input id="cdD" placeholder="DD" type=number min=1 max=31><input id="cdH" placeholder="HH" type=number min=0 max=23><input id="cdMn" placeholder="MM" type=number min=0 max=59></div><div class="countdown-buttons"><button class="countdown-btn" id="cdSet">Set</button><button class="countdown-btn" id="cdClr">Clear</button></div></div>';
          let target=null,iv=null;
          const tick=()=>{if(!target){el.querySelector('#cdT').textContent='--:--:--';el.querySelector('#cdL').textContent='SET A DATE';return}const diff=target-Date.now();if(diff<=0){el.querySelector('#cdT').textContent='00:00:00';el.querySelector('#cdL').textContent="IT'S TIME!";clearInterval(iv);iv=null;return}const s=Math.floor(diff/1000),h=Math.floor(s/3600),m=Math.floor(s%3600/60),sec=s%60;el.querySelector('#cdT').textContent=String(h).padStart(2,'0')+':'+String(m).padStart(2,'0')+':'+String(sec).padStart(2,'0');const d=Math.ceil(diff/86400000);el.querySelector('#cdL').textContent=d===1?'TOMORROW':d+' DAYS'};
          const st=localStorage.getItem('miku-cd');if(st){target=new Date(st);iv=setInterval(tick,1000)}tick();
          el.querySelector('#cdSet').onclick=()=>{const mo=el.querySelector('#cdMo').value,d=el.querySelector('#cdD').value,h=el.querySelector('#cdH').value,mn=el.querySelector('#cdMn').value;if(!mo||!d)return;const now=new Date();target=new Date(now.getFullYear(),parseInt(mo)-1,parseInt(d),parseInt(h)||0,parseInt(mn)||0);if(target<now)target.setFullYear(now.getFullYear()+1);localStorage.setItem('miku-cd',target.toISOString());if(!iv)iv=setInterval(tick,1000);tick()};
          el.querySelector('#cdClr').onclick=()=>{target=null;clearInterval(iv);iv=null;localStorage.removeItem('miku-cd');el.querySelector('#cdMo').value='';el.querySelector('#cdD').value='';el.querySelector('#cdH').value='';el.querySelector('#cdMn').value='';tick()};
        }
      },
      crypto: { name:'Crypto', icon:'💰', unique:true, render:async(el)=>{el.innerHTML='<div><span class="wloading">Loading...</span></div>';try{const r=await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum&vs_currencies=gbp&include_24hr_change=true');const d=await r.json();const row=(s,data)=>{if(!data)return'';const p='£'+data.gbp.toLocaleString(undefined,{minimumFractionDigits:0,maximumFractionDigits:0});const c=(data.gbp_24h_change||0).toFixed(1);const cls=parseFloat(c)>=0?'up':'down';return'<div class="ticker-row"><span class="ticker-name">'+s+'</span><span><span class="ticker-price">'+p+'</span><span class="ticker-change '+cls+'">'+(parseFloat(c)>=0?'+':'')+c+'%</span></span></div>'};el.innerHTML='<div>'+row('BTC',d.bitcoin)+row('ETH',d.ethereum)+'</div>'}catch{el.innerHTML='<div><span class="werror">Unavailable</span></div>'}}},
      spell: { name:'D&D Spell', icon:'🔮', unique:false, render:async(el)=>{el.innerHTML='<div class="stack"><span class="wloading">Summoning...</span></div>';try{const id=Math.floor(Math.random()*300+1);const r=await fetch('https://www.dnd5eapi.co/api/spells/'+id);const d=await r.json();if(d.error)throw new Error();el.innerHTML='<div class="stack"><span class="wtitle wacc3">'+d.name+'</span><span class="wsub">'+(d.school?.name||'Unknown')+' · '+(d.casting_time||'?')+'</span><span class="wsub wacc">'+(d.level===0?'✨ Cantrip':'Lvl '+d.level)+'</span></div>'}catch{el.innerHTML='<div><span class="werror">Unavailable</span></div>'}}},
      joke: { name:'Random Joke', icon:'😄', unique:false, render:async(el)=>{el.innerHTML='<div class="stack"><span class="wloading">Loading...</span></div>';try{const r=await fetch('https://official-joke-api.appspot.com/jokes/random');const d=await r.json();el.innerHTML='<div class="stack"><span style="font-size:0.85rem">'+d.setup+'</span><span class="wacc2" style="font-weight:600;font-size:0.9rem">'+d.punchline+'</span></div>'}catch{el.innerHTML='<div><span class="werror">Unavailable</span></div>'}}},
      fact: { name:'Useless Fact', icon:'💡', unique:false, render:async(el)=>{el.innerHTML='<div class="stack"><span class="wloading">Thinking...</span></div>';try{const r=await fetch('https://uselessfacts.jsph.pl/api/v2facts/random?language=en');const d=await r.json();el.innerHTML='<span style="font-size:0.82rem;line-height:1.4">'+d.text+'</span>'}catch{el.innerHTML='<div><span class="werror">Unavailable</span></div>'}}},
      currency: { name:'Currency', icon:'💱', unique:false, render:async(el)=>{el.innerHTML='<div class="stack"><span class="wloading">Fetching rates...</span></div>';try{const r=await fetch('https://api.frankfurter.app/latest?from=GBP');const d=await r.json();const { USD, EUR, JPY } = d.rates;el.innerHTML='<div class="stack"><span class="wtitle">💷 GBP</span><span class="wsub">🇺🇸 $'+USD.toFixed(2)+' &nbsp; 🇪🇺 €'+EUR.toFixed(2)+' &nbsp; 🇯🇵 ¥'+JPY.toFixed(0)+'</span></div>'}catch{el.innerHTML='<div><span class="werror">Unavailable</span></div>'}}},
      games: { name:'F2P Game', icon:'🕹️', unique:false, render:async(el)=>{el.innerHTML='<div class="stack"><span class="wloading">Loading...</span></div>';try{const r=await fetch('https://www.freetogame.com/api/games?sort-by=release-date&order=desc&limit=1');const[g]=await r.json();el.innerHTML='<div class="stack"><span class="wtitle wacc">'+g.title+'</span><span class="wsub">'+g.genre+' · '+g.platform+'</span>'+(g.game_url?'<span class="wsub wacc3">🌐 Browser game</span>':'')+'</div>'}catch{el.innerHTML='<div><span class="werror">Unavailable</span></div>'}}},
      monster: { name:'D&D Monster', icon:'👹', unique:false, render:async(el)=>{el.innerHTML='<div class="stack"><span class="wloading">Summoning beast...</span></div>';try{const id=Math.floor(Math.random()*300+1);const r=await fetch('https://www.dnd5eapi.co/api/monsters/'+id);const m=await r.json();if(m.error)throw new Error();const ac=m.armor_class?(m.armor_class[0]?.value??m.armor_class):'?';el.innerHTML='<div class="stack"><span class="wtitle wacc2">'+m.name+'</span><span class="wsub">⚔️ CR '+m.challenge_rating+' &nbsp; 🛡️ AC '+ac+' &nbsp; ❤️ HP '+m.hit_points+'</span><span class="wsub">'+m.size+' '+m.type+' · '+(m.alignment||'unaligned')+'</span></div>'}catch{el.innerHTML='<div><span class="werror">Unavailable</span></div>'}}},
      news: { name:'Hacker News', icon:'📡', unique:false, render:async(el)=>{el.innerHTML='<div class="stack"><span class="wloading">Loading...</span></div>';try{const r=await fetch('https://hacker-news.firebaseio.com/v0/topstories.json');const ids=await r.json();const top=ids.slice(0,5);const stories=await Promise.all(top.map(id=>fetch('https://hacker-news.firebaseio.com/v0/item/'+id+'.json').then(x=>x.json())));el.innerHTML=stories.map(s=>'<div class="news-item"><a href="'+(s.url||'https://news.ycombinator.com/item?id='+s.id)+'" target="_blank">'+s.title+'</a></div>').join('')}catch{el.innerHTML='<div><span class="werror">Unavailable</span></div>'}}}
    };

    const DEFAULT_LAYOUT=[
      {id:'quicklinks',x:30,y:130,w:220,pinned:false},
      {id:'weather',x:280,y:130,w:210,pinned:false},
      {id:'system',x:520,y:130,w:200,pinned:false},
      {id:'pomodoro',x:30,y:370,w:200,pinned:false},
      {id:'notes',x:260,y:370,w:260,pinned:false},
      {id:'nowplaying',x:550,y:370,w:220,pinned:false},
    ];

    function loadLayout(){try{return JSON.parse(localStorage.getItem('miku-widget-layout'))}catch{return null}}
    function saveLayout(layout){localStorage.setItem('miku-widget-layout',JSON.stringify(layout))}

    let editMode=false;
    const canvas=document.getElementById('widget-canvas');
    let drag=false,offX=0,offY=0,dragCard=null;

    function renderWidgets(){
      canvas.innerHTML='';
      const layout=loadLayout()||DEFAULT_LAYOUT.map(l=>({...l}));
      layout.forEach(item=>{
        const def=WIDGET_REGISTRY[item.id];
        if(!def)return;
        const card=document.createElement('div');
        card.className='widget-card'+(editMode?' edit-mode':'')+(item.pinned?' pinned':'');
        card.dataset.widgetId=item.id;
        card.style.left=item.x+'px';
        card.style.top=item.y+'px';
        card.innerHTML='<span class="pin-indicator">📌</span>'+
          '<div class="widget-controls">'+
            '<span class="widget-drag-handle" title="Drag">⋮⋮</span>'+
            '<span class="widget-pin-btn'+(item.pinned?' pinned':'')+'" title="Pin">📌</span>'+
            '<span class="widget-remove-btn" title="Remove">×</span>'+
          '</div>'+
          '<div class="widget-title-bar">'+def.icon+' '+def.name+'</div>'+
          '<div class="widget-body"></div>';
        canvas.appendChild(card);
        const r=def.render(card.querySelector('.widget-body'));
        if(r&&typeof r.then==='function')r.catch(()=>{});
        card.querySelector('.widget-remove-btn').onclick=()=>{const lay=loadLayout()||DEFAULT_LAYOUT.map(l=>({...l}));const idx=lay.findIndex(l=>l.id===item.id);if(idx!==-1)lay.splice(idx,1);saveLayout(lay);card.remove()};
        card.querySelector('.widget-pin-btn').onclick=()=>{const lay=loadLayout()||DEFAULT_LAYOUT.map(l=>({...l}));const e=lay.find(l=>l.id===item.id);if(e){e.pinned=!e.pinned;saveLayout(lay);card.classList.toggle('pinned',e.pinned);card.querySelector('.widget-pin-btn').classList.toggle('pinned',e.pinned)}};
        let drag=false,offX=0,offY=0;
        card.querySelector('.widget-drag-handle').onmousedown=e=>{const lay=loadLayout()||DEFAULT_LAYOUT.map(l=>({...l}));const entry=lay.find(l=>l.id===item.id);if(entry&&entry.pinned)return;drag=true;dragCard=card;card.classList.add('dragging');offX=e.clientX-card.offsetLeft;offY=e.clientY-card.offsetTop;e.preventDefault()};
      });
    }

    document.addEventListener('mousemove',e=>{if(!drag||!dragCard)return;dragCard.style.left=(e.clientX-offX)+'px';dragCard.style.top=(e.clientY-offY)+'px'});
    document.addEventListener('mouseup',()=>{if(!drag||!dragCard)return;drag=false;dragCard.classList.remove('dragging');const id=dragCard.dataset.widgetId;const lay=loadLayout()||DEFAULT_LAYOUT.map(l=>({...l}));const e=lay.find(l=>l.id===id);if(e){e.x=dragCard.offsetLeft;e.y=dragCard.offsetTop;saveLayout(lay)}dragCard=null;});

    document.getElementById('editModeBtn').onclick=()=>{editMode=!editMode;document.getElementById('editModeBtn').classList.toggle('active',editMode);document.getElementById('editModeBtn').textContent=editMode?'✓ Done':'✎ Edit';document.querySelectorAll('.widget-card').forEach(c=>c.classList.toggle('edit-mode',editMode))};
    document.getElementById('addWidgetBtn').onclick=openAddModal;
    document.getElementById('closeModalBtn').onclick=()=>document.getElementById('add-widget-modal').classList.remove('open');
    document.getElementById('add-widget-modal').onclick=e=>{if(e.target.id==='add-widget-modal')document.getElementById('add-widget-modal').classList.remove('open')};
    function openAddModal(){
      const modal=document.getElementById('add-widget-modal');
      const grid=document.getElementById('modalGrid');
      const layout=loadLayout()||DEFAULT_LAYOUT.map(l=>({...l}));
      const activeIds=new Set(layout.map(l=>l.id));
      grid.innerHTML='';
      Object.entries(WIDGET_REGISTRY).forEach(([id,def])=>{
        const already=def.unique&&activeIds.has(id);
        const opt=document.createElement('div');
        opt.className='modal-opt'+(already?' existing':'');
        opt.innerHTML='<div class="modal-opt-icon">'+def.icon+'</div><div class="modal-opt-name">'+def.name+'</div><div class="modal-opt-desc">'+(already?'Added':'Click to add')+'</div>';
        if(!already)opt.onclick=()=>{const lay=loadLayout()||DEFAULT_LAYOUT.map(l=>({...l}));const defaults={};DEFAULT_LAYOUT.forEach(d=>defaults[d.id]=d);const dp=defaults[id]||{x:30+(lay.length%4)*260,y:130+Math.floor(lay.length/4)*240,w:220};lay.push({id,x:dp.x,y:dp.y,w:dp.w||220,pinned:false});saveLayout(lay);modal.classList.remove('open');renderWidgets()};
        grid.appendChild(opt);
      });
      modal.classList.add('open');
    }

    /* PARTICLES */
    const particlesContainer=document.getElementById('particles');
    for(let i=0;i<40;i++){const p=document.createElement('div');p.className='particle';p.style.left=Math.random()*100+'%';p.style.top=Math.random()*100+'%';p.style.animationDelay=Math.random()*5+'s';particlesContainer.appendChild(p)}

    /* CLOCK */
    function updateClock(){const now=new Date();document.getElementById('clock').textContent=now.toLocaleTimeString('en-GB',{hour:'2-digit',minute:'2-digit'});document.getElementById('date').textContent=now.toLocaleDateString('en-GB',{weekday:'long',day:'numeric',month:'long'})}
    updateClock();setInterval(updateClock,1000);

    /* SEARCH */
    document.getElementById('searchInput').addEventListener('keydown',e=>{if(e.key==='Enter'){const q=e.target.value.trim();if(q){window.open('https://google.com/search?q='+encodeURIComponent(q),'_blank');e.target.value=''}}});

    /* INIT */
    renderWidgets();