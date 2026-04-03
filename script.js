    /* WIDGET REGISTRY */
    const WIDGET_REGISTRY = {
      quicklinks: {
        name: 'Quick Links', icon: '🎤', unique: true,
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
        name: 'Weather', icon: '🌸', unique: true,
        render: async (el) => {
          el.innerHTML='<div class="weather-widget"><div class="weather-icon weather-icon">🌤️</div><div class="weather-temp weather-temp">--°</div><div class="weather-desc weather-desc">Detecting...</div><div class="weather-loc-row"><input class="weather-loc-input" id="wLoc" placeholder="City or postcode" maxlength=40><button class="weather-loc-btn" id="wLocBtn">Go</button></div></div>';
          const icon=el.querySelector('.weather-icon'),temp=el.querySelector('.weather-temp'),desc=el.querySelector('.weather-desc'),locInput=el.querySelector('.weather-loc-input'),locBtn=el.querySelector('.weather-loc-btn');
          locInput.value=localStorage.getItem('miku-weather-loc')||'';
          async function fetchWeather(loc){
            try{
              const url=loc?'https://wttr.in/'+encodeURIComponent(loc)+'?format=j1':'https://wttr.in/?format=j1';
              const r=await fetch(url);if(!r.ok)throw new Error();const d=await r.json();const c=d.current_condition[0];
              const icons={'sun':'☀️','clear':'☀️','cloud':'⛅','rain':'🌧️','snow':'❄️','thunder':'⛈️','fog':'🌫️','mist':'🌫️'};
              let ico='🌤️',wd=(c.weatherDesc[0].value||'').toLowerCase();for(const k of Object.keys(icons))if(wd.includes(k)){ico=icons[k];break}
              icon.textContent=ico;temp.textContent=c.temp_C+'°C';desc.textContent=c.weatherDesc[0].value;
            }catch{icon.textContent='🌤️';temp.textContent='--°';desc.textContent='Unavailable';}
          }
          locBtn.onclick=()=>{const v=locInput.value.trim();localStorage.setItem('miku-weather-loc',v);fetchWeather(v)};
          locInput.onkeydown=e=>{if(e.key==='Enter')locBtn.click()};
          fetchWeather(locInput.value);
        }
      },
      pomodoro: {
        name: 'Pomodoro', icon: '🎵', unique: true,
        render: (el) => {
          el.innerHTML='<div class="pomodoro-display"><div class="pomo-time" id="pTime">25:00</div><div class="pomo-buttons"><button class="pomo-btn" id="pStart">Start</button><button class="pomo-btn" id="pReset">Reset</button></div></div>';
          const pom={dur:1500,rem:1500,iv:null,run:false};
          const tick=()=>{pom.rem--;const m=Math.floor(pom.rem/60),s=pom.rem%60;el.querySelector('#pTime').textContent=String(m).padStart(2,'0')+':'+String(s).padStart(2,'0');if(pom.rem<=0){pom.run=false;pom.rem=pom.dur;clearInterval(pom.iv);pom.iv=null;el.querySelector('#pStart').textContent='Start'}};
          el.querySelector('#pStart').onclick=()=>{if(pom.run){clearInterval(pom.iv);pom.run=false;pom.iv=null;el.querySelector('#pStart').textContent='Resume'}else{pom.run=true;el.querySelector('#pStart').textContent='Pause';pom.iv=setInterval(tick,1000)}};
          el.querySelector('#pReset').onclick=()=>{clearInterval(pom.iv);pom.run=false;pom.iv=null;pom.rem=pom.dur;el.querySelector('#pTime').textContent='25:00';el.querySelector('#pStart').textContent='Start'};
        }
      },
      notes: { name: 'Quick Notes', icon: '📝', unique: true, render:(el)=>{el.innerHTML='<textarea class="notes-input notes-textarea" placeholder="Jot down ideas..."></textarea>';const ta=el.querySelector('.notes-textarea');ta.value=localStorage.getItem('miku-notes')||'';ta.oninput=()=>localStorage.setItem('miku-notes',ta.value)}},
      countdown: {
        name: 'Countdown', icon: '📅', unique: true,
        render:(el)=>{
          el.innerHTML='<div class="countdown-display"><div class="countdown-time" id="cdT">--:--:--</div><div class="countdown-label" id="cdL">SET A DATE</div><div class="countdown-inputs"><input id="cdMo" placeholder="MM" type=number min=1 max=12><input id="cdD" placeholder="DD" type=number min=1 max=31><input id="cdH" placeholder="HH" type=number min=0 max=23><input id="cdMn" placeholder="MM" type=number min=0 max=59></div><div class="countdown-buttons"><button class="countdown-btn" id="cdSet">Set</button><button class="countdown-btn" id="cdClr">Clear</button></div></div>';
          let target=null,iv=null;
          const tick=()=>{if(!target){el.querySelector('#cdT').textContent='--:--:--';el.querySelector('#cdL').textContent='SET A DATE';return}const diff=target-Date.now();if(diff<=0){el.querySelector('#cdT').textContent='00:00:00';el.querySelector('#cdL').textContent="IT'S TIME!";clearInterval(iv);iv=null;return}const s=Math.floor(diff/1000),h=Math.floor(s/3600),m=Math.floor(s%3600/60),sec=s%60;el.querySelector('#cdT').textContent=String(h).padStart(2,'0')+':'+String(m).padStart(2,'0')+':'+String(sec).padStart(2,'0');const d=Math.ceil(diff/86400000);el.querySelector('#cdL').textContent=d===1?'TOMORROW':d+' DAYS'};
          const st=localStorage.getItem('miku-cd');if(st){target=new Date(st);iv=setInterval(tick,1000)}tick();
          el.querySelector('#cdSet').onclick=()=>{const mo=el.querySelector('#cdMo').value,d=el.querySelector('#cdD').value,h=el.querySelector('#cdH').value,mn=el.querySelector('#cdMn').value;if(!mo||!d)return;const now=new Date();target=new Date(now.getFullYear(),parseInt(mo)-1,parseInt(d),parseInt(h)||0,parseInt(mn)||0);if(target<now)target.setFullYear(now.getFullYear()+1);localStorage.setItem('miku-cd',target.toISOString());if(!iv)iv=setInterval(tick,1000);tick()};
          el.querySelector('#cdClr').onclick=()=>{target=null;clearInterval(iv);iv=null;localStorage.removeItem('miku-cd');el.querySelector('#cdMo').value='';el.querySelector('#cdD').value='';el.querySelector('#cdH').value='';el.querySelector('#cdMn').value='';tick()};
        }
      },
      spell: { name:'D&D Spell', icon:'🔮', unique:false, render:async(el)=>{el.innerHTML='<div class="stack"><span class="wloading">Summoning...</span></div>';try{const id=Math.floor(Math.random()*300+1);const r=await fetch('https://www.dnd5eapi.co/api/spells/'+id);const d=await r.json();if(d.error)throw new Error();el.innerHTML='<div class="stack"><span class="wtitle wacc3">'+d.name+'</span><span class="wsub">'+(d.school?.name||'Unknown')+' · '+(d.casting_time||'?')+'</span><span class="wsub wacc">'+(d.level===0?'✨ Cantrip':'Lvl '+d.level)+'</span></div>'}catch{el.innerHTML='<div><span class="werror">Unavailable</span></div>'}}},
      joke: { name:'Random Joke', icon:'🎭', unique:false, render:async(el)=>{el.innerHTML='<div class="stack"><span class="wloading">Loading...</span></div>';try{const r=await fetch('https://official-joke-api.appspot.com/jokes/random');const d=await r.json();el.innerHTML='<div class="stack"><span style="font-size:0.85rem">'+d.setup+'</span><span class="wacc2" style="font-weight:600;font-size:0.9rem">'+d.punchline+'</span></div>'}catch{el.innerHTML='<div><span class="werror">Unavailable</span></div>'}}},
      fact: { name:'Useless Fact', icon:'💡', unique:false, render:async(el)=>{el.innerHTML='<div class="stack"><span class="wloading">Thinking...</span></div>';try{const r=await fetch('https://uselessfacts.jsph.pl/api/v2facts/random?language=en');const d=await r.json();el.innerHTML='<span style="font-size:0.82rem;line-height:1.4">'+d.text+'</span>'}catch{el.innerHTML='<div><span class="werror">Unavailable</span></div>'}}},
      currency: { name:'Currency', icon:'💱', unique:false, render:async(el)=>{el.innerHTML='<div class="stack"><span class="wloading">Fetching rates...</span></div>';try{const r=await fetch('https://api.frankfurter.app/latest?from=GBP');const d=await r.json();const { USD, EUR, JPY } = d.rates;el.innerHTML='<div class="stack"><span class="wtitle">💷 GBP</span><span class="wsub">🇺🇸 $'+USD.toFixed(2)+' &nbsp; 🇪🇺 €'+EUR.toFixed(2)+' &nbsp; 🇯🇵 ¥'+JPY.toFixed(0)+'</span></div>'}catch{el.innerHTML='<div><span class="werror">Unavailable</span></div>'}}},
      games: { name:'F2P Game', icon:'🕹️', unique:false, render:async(el)=>{el.innerHTML='<div class="stack"><span class="wloading">Loading...</span></div>';try{const r=await fetch('https://www.freetogame.com/api/games?sort-by=release-date&order=desc&limit=1');const[g]=await r.json();el.innerHTML='<div class="stack"><span class="wtitle wacc">'+g.title+'</span><span class="wsub">'+g.genre+' · '+g.platform+'</span>'+(g.game_url?'<span class="wsub wacc3">🌐 Browser game</span>':'')+'</div>'}catch{el.innerHTML='<div><span class="werror">Unavailable</span></div>'}}},
      monster: { name:'D&D Monster', icon:'👹', unique:false, render:async(el)=>{el.innerHTML='<div class="stack"><span class="wloading">Summoning beast...</span></div>';try{const id=Math.floor(Math.random()*300+1);const r=await fetch('https://www.dnd5eapi.co/api/monsters/'+id);const m=await r.json();if(m.error)throw new Error();const ac=m.armor_class?(m.armor_class[0]?.value??m.armor_class):'?';el.innerHTML='<div class="stack"><span class="wtitle wacc2">'+m.name+'</span><span class="wsub">⚔️ CR '+m.challenge_rating+' &nbsp; 🛡️ AC '+ac+' &nbsp; ❤️ HP '+m.hit_points+'</span><span class="wsub">'+m.size+' '+m.type+' · '+(m.alignment||'unaligned')+'</span></div>'}catch{el.innerHTML='<div><span class="werror">Unavailable</span></div>'}}},
      api: { name:'API Viewer', icon:'🎛', unique:true, render:async(el)=>{el.innerHTML='<div class="api-widget"><div class="api-row"><input class="api-input" id="apiUrl" placeholder="https://api.example.com/data" maxlength=500><button class="api-btn" id="apiGo">Go</button></div><div class="api-output" id="apiOut">Enter a URL</div></div>';const out=el.querySelector('#apiOut'),urlIn=el.querySelector('#apiUrl');urlIn.value=localStorage.getItem('miku-api-url')||'';urlIn.onkeydown=e=>{if(e.key==='Enter')el.querySelector('#apiGo').click()};el.querySelector('#apiGo').onclick=async()=>{const u=urlIn.value.trim();if(!u)return;localStorage.setItem('miku-api-url',u);out.textContent='Loading...';try{const r=await fetch(u);if(!r.ok)throw new Error('HTTP '+r.status);const d=await r.text();const formatted=d.length>800?JSON.stringify(JSON.parse(d),null,2).slice(0,800)+'...[truncated]':JSON.stringify(JSON.parse(d),null,2);out.innerHTML='<pre class="api-pre">'+formatted.replace(/</g,'&lt;').replace(/>/g,'&gt;')+'</pre>';out.style.fontSize='0.7rem'}catch{out.textContent='Error: could not fetch'}};if(urlIn.value)el.querySelector('#apiGo').click()}},
      rss: { name:'RSS Feed', icon:'🌐', unique:false, render:async(el)=>{const wid=item.id;const storedUrl=localStorage.getItem('miku-rss-'+wid)||'';const showInput=()=>{el.innerHTML='<div class="rss-widget"><div class="rss-row"><input class="rss-input" id="rssUrl" placeholder="https://example.com/feed.xml" maxlength=500><button class="rss-btn" id="rssGo">Go</button></div><div class="rss-output" id="rssOut">'+(storedUrl?'Saved: '+storedUrl:'Enter a feed URL')+'</div></div>';const out=el.querySelector('#rssOut'),urlIn=el.querySelector('#rssUrl');urlIn.value=storedUrl;urlIn.onkeydown=e=>{if(e.key==='Enter')el.querySelector('#rssGo').click()};el.querySelector('#rssGo').onclick=async()=>{const u=urlIn.value.trim();if(!u)return;localStorage.setItem('miku-rss-'+wid,u);el.querySelector('.rss-row').style.display='none';out.textContent='Loading...';try{const r=await fetch('https://api.rss2json.com/v1/api.json?rss_url='+encodeURIComponent(u));const d=await r.json();if(d.status!=='ok')throw new Error();const items=d.items.slice(0,5);out.innerHTML='<div class="rss-saved-url">'+u+'</div>'+items.map(i=>'<div class="rss-item"><a href="'+i.link+'" target="_blank" class="rss-title">'+i.title+'</a><div class="rss-date">'+new Date(i.pubDate).toLocaleDateString()+'</div></div>').join('');out.style.display='block'}catch{out.innerHTML='<span class="werror">Could not load feed</span>'}}};if(storedUrl){el.innerHTML='<div class="rss-widget"><div class="rss-output" id="rssOut">Loading...</div></div>';const out=el.querySelector('#rssOut');try{const r=await fetch('https://api.rss2json.com/v1/api.json?rss_url='+encodeURIComponent(storedUrl));const d=await r.json();if(d.status!=='ok')throw new Error();const items=d.items.slice(0,5);out.innerHTML='<div class="rss-saved-url">'+storedUrl+'</div>'+items.map(i=>'<div class="rss-item"><a href="'+i.link+'" target="_blank" class="rss-title">'+i.title+'</a><div class="rss-date">'+new Date(i.pubDate).toLocaleDateString()+'</div></div>').join('')}catch{out.innerHTML='<span class="werror">Unavailable</span>'}}else{showInput()}}},
      todo: { name:'To-Do List', icon:'📋', unique:true, render:(el)=>{const tid='miku-todo-'+item.id;el.innerHTML='<div class="todo-widget"><div class="todo-input-row"><input class="todo-input" id="todoInput" placeholder="Add a task..." maxlength=200><button class="todo-add-btn" id="todoAdd">+</button></div><div class="todo-list" id="todoList"></div></div>';const list=el.querySelector('#todoList'),input=el.querySelector('#todoInput'),addBtn=el.querySelector('#todoAdd');function load(){const items=JSON.parse(localStorage.getItem(tid)||'[]');list.innerHTML=items.map((t,i)=>'<div class="todo-item'+(t.done?' done':'')+'"><input type="checkbox" class="todo-check" '+(t.done?'checked':'')+' data-i="'+i+'"><span class="todo-text">'+t.text+'</span><button class="todo-del" data-i="'+i+'">×</button></div>').join('')};function save(items){localStorage.setItem(tid,JSON.stringify(items))};load();addBtn.onclick=()=>{const v=input.value.trim();if(!v)return;const items=JSON.parse(localStorage.getItem(tid)||'[]');items.push({text:v,done:false});save(items);input.value='';load()};input.onkeydown=e=>{if(e.key==='Enter')addBtn.click()};list.onclick=e=>{const items=JSON.parse(localStorage.getItem(tid)||'[]');if(e.target.classList.contains('todo-check')){const i=parseInt(e.target.dataset.i,10);items[i].done=e.target.checked;save(items);load()};if(e.target.classList.contains('todo-del')){const i=parseInt(e.target.dataset.i,10);items.splice(i,1);save(items);load()}}}},
      importexport: { name:'Import / Export', icon:'💾', unique:true, render:(el)=>{el.innerHTML='<div class="ie-widget"><textarea class="ie-textarea" id="ieArea" placeholder="Your layout JSON will appear here..."></textarea><div class="ie-buttons"><button class="ie-btn" id="ieExport">Export</button><button class="ie-btn" id="ieImport">Import</button></div></div>';const ta=el.querySelector('#ieArea');ta.value=localStorage.getItem('miku-widget-layout')||'';el.querySelector('#ieExport').onclick=()=>{navigator.clipboard.writeText(JSON.stringify(loadLayout(),null,2)).catch(()=>{});ta.select();document.execCommand('copy');ta.value='Copied to clipboard!';setTimeout(()=>{ta.value=JSON.stringify(loadLayout(),null,2)},1500)};el.querySelector('#ieImport').onclick=()=>{try{const data=JSON.parse(ta.value);if(Array.isArray(data)){saveLayout(data);renderWidgets();ta.value='Layout imported!';setTimeout(()=>{ta.value=''},1500)}else{ta.value='Invalid layout format'};}catch{ta.value='Invalid JSON'}}}}
    };

    const DEFAULT_LAYOUT=[
      {id:'quicklinks',x:30,y:130,w:220,pinned:false},
      {id:'weather',x:280,y:130,w:210,pinned:false},
      {id:'pomodoro',x:30,y:370,w:200,pinned:false},
      {id:'notes',x:260,y:370,w:260,pinned:false},
    ];

    function loadLayout(){try{return JSON.parse(localStorage.getItem('miku-widget-layout'))}catch{return null}}
    function saveLayout(layout){localStorage.setItem('miku-widget-layout',JSON.stringify(layout))}

    let editMode=false;
    const canvas=document.getElementById('widget-canvas');
    let drag=false,offX=0,offY=0,dragCard=null;
    let resizing=false,resizeStartX=0,resizeStartY=0,resizeStartW=0,resizeStartH=0,resizeCard=null;

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
        if(item.w)card.style.width=item.w+'px';
        if(item.h)card.style.height=item.h+'px';
        card.innerHTML='<div class="widget-title-bar widget-drag-handle"><span class="wi">'+def.icon+'</span><span class="wn">'+def.name+'</span><span class="widget-close-btn" data-id="'+item.id+'">✕</span></div><div class="widget-body"></div><div class="widget-resize-handle" data-id="'+item.id+'"></div>';
        canvas.appendChild(card);
        const r=def.render(card.querySelector('.widget-body'));
        if(r&&typeof r.then==='function')r.catch(()=>{});
        card.querySelector('.widget-close-btn').onclick=()=>{const lay=loadLayout()||DEFAULT_LAYOUT.map(l=>({...l}));const idx=lay.findIndex(l=>l.id===item.id);if(idx!==-1)lay.splice(idx,1);saveLayout(lay);card.remove()};
        card.querySelector('.widget-resize-handle').onmousedown=e=>{const lay=loadLayout()||DEFAULT_LAYOUT.map(l=>({...l}));const entry=lay.find(l=>l.id===item.id);if(entry&&entry.pinned)return;resizing=true;resizeCard=card;resizeStartX=e.clientX;resizeStartY=e.clientY;resizeStartW=card.offsetWidth;resizeStartH=card.offsetHeight;card.classList.add('resizing');e.preventDefault();e.stopPropagation();};
        card.querySelector('.widget-drag-handle').onmousedown=e=>{const lay=loadLayout()||DEFAULT_LAYOUT.map(l=>({...l}));const entry=lay.find(l=>l.id===item.id);if(entry&&entry.pinned)return;drag=true;dragCard=card;card.classList.add('dragging');offX=e.clientX-card.offsetLeft;offY=e.clientY-card.offsetTop;e.preventDefault()};
      });
    }

    document.addEventListener('mousemove',e=>{if(!drag||!dragCard){if(resizing&&resizeCard){const w=Math.max(160,resizeStartW+e.clientX-resizeStartX);const h=Math.max(100,resizeStartH+e.clientY-resizeStartY);resizeCard.style.width=w+'px';resizeCard.style.height=h+'auto'}}else{dragCard.style.left=(e.clientX-offX)+'px';dragCard.style.top=(e.clientY-offY)+'px'}});
    document.addEventListener('mouseup',()=>{if(resizing&&resizeCard){const lay=loadLayout()||DEFAULT_LAYOUT.map(l=>({...l}));const entry=lay.find(l=>l.id===resizeCard.dataset.widgetId);if(entry){entry.w=parseInt(resizeCard.style.width,10)||entry.w;entry.h=parseInt(resizeCard.style.height,10)||entry.h;saveLayout(lay)}resizeCard.classList.remove('resizing');resizing=false;resizeCard=null}else if(drag&&dragCard){drag=false;dragCard.classList.remove('dragging');const id=dragCard.dataset.widgetId;const lay=loadLayout()||DEFAULT_LAYOUT.map(l=>({...l}));const e=lay.find(l=>l.id===id);if(e){e.x=dragCard.offsetLeft;e.y=dragCard.offsetTop;saveLayout(lay)}dragCard=null}});

    const cornerMenu=document.getElementById('cornerMenu');
    const cornerDropdown=document.getElementById('cornerDropdown');
    const cornerHamburger=document.getElementById('cornerHamburger');
    const editDot=document.getElementById('editDot');

    cornerHamburger.onclick=(e)=>{e.stopPropagation();cornerDropdown.classList.toggle('open')};
    document.addEventListener('click',()=>cornerDropdown.classList.remove('open'));
    cornerDropdown.onclick=e=>e.stopPropagation();

    document.getElementById('menuEditWidgets').onclick=()=>{editMode=!editMode;editDot.classList.toggle('active',editMode);document.querySelectorAll('.widget-card').forEach(c=>c.classList.toggle('edit-mode',editMode));cornerDropdown.classList.remove('open')};
    document.getElementById('menuImportExport').onclick=()=>{const lay=loadLayout()||DEFAULT_LAYOUT.map(l=>({...l}));const idx=lay.findIndex(l=>l.id==='importexport');if(idx!==-1){lay.splice(idx,1)};const defaults={};DEFAULT_LAYOUT.forEach(d=>defaults[d.id]=d);lay.push({id:'importexport',x:30,y:30,w:280,h:null,pinned:false});saveLayout(lay);renderWidgets();cornerDropdown.classList.remove('open')};
    document.getElementById('cornerAdd').onclick=()=>{openAddModal();cornerDropdown.classList.remove('open')};

    // ---- Settings ----
    function setBackground(url) {
      const bg = document.querySelector('.bg-image');
      if (!bg) return;
      if (!url || url === 'default') {
        bg.style.background = "var(--miku-darker) url('miku-bg.png') center/cover no-repeat";
        bg.style.opacity = '0.75';
      } else {
        bg.style.background = "url('" + url + "') center/cover no-repeat";
      }
      localStorage.setItem('miku-bg', url || 'default');
      document.querySelectorAll('.bg-preset').forEach(p => p.classList.remove('active'));
      const preset = document.querySelector('.bg-preset[data-bg="' + (url || 'default') + '"]');
      if (preset) preset.classList.add('active');
    }

    function loadSettings() {
      const savedBg = localStorage.getItem('miku-bg') || 'default';
      const savedOpacity = parseFloat(localStorage.getItem('miku-bg-opacity') || '0.75');
      const savedBlur = parseInt(localStorage.getItem('miku-bg-blur') || '0', 10);
      const bg = document.querySelector('.bg-image');
      if (bg) {
        bg.style.opacity = savedOpacity;
        bg.style.filter = savedBlur > 0 ? 'blur(' + savedBlur + 'px)' : 'none';
        if (savedBg !== 'default') {
          bg.style.background = "url('" + savedBg + "') center/cover no-repeat";
        }
      }
      const opacitySlider = document.getElementById('bgOpacitySlider');
      if (opacitySlider) {
        opacitySlider.value = Math.round(savedOpacity * 100);
        document.getElementById('opacityValue').textContent = Math.round(savedOpacity * 100) + '%';
      }
      const blurSlider = document.getElementById('bgBlurSlider');
      if (blurSlider) {
        blurSlider.value = savedBlur;
        document.getElementById('blurValue').textContent = savedBlur > 0 ? savedBlur + 'px' : 'None';
      }
      document.querySelectorAll('.bg-preset').forEach(p => p.classList.remove('active'));
      const active = document.querySelector('.bg-preset[data-bg="' + savedBg + '"]');
      if (active) active.classList.add('active');
    }

    document.getElementById('menuSettings').onclick=()=>{cornerDropdown.classList.remove('open');document.getElementById('settings-modal').classList.add('open');};
    document.getElementById('closeSettingsBtn').onclick=()=>document.getElementById('settings-modal').classList.remove('open');
    document.getElementById('settings-modal').onclick=e=>{if(e.target.id==='settings-modal')document.getElementById('settings-modal').classList.remove('open')};
    document.getElementById('applyBgUrl').onclick=()=>{const url=document.getElementById('bgUrlInput').value.trim();if(url)setBackground(url)};
    document.getElementById('bgUrlInput').onkeydown=e=>{if(e.key==='Enter')document.getElementById('applyBgUrl').click()};
    document.getElementById('uploadBgBtn').onclick=()=>document.getElementById('bgFileInput').click();
    document.getElementById('bgFileInput').onchange=function(){const file=this.files[0];if(!file)return;const reader=new FileReader();reader.onload=function(e){setBackground(e.target.result)};reader.readAsDataURL(file)};
    document.getElementById('bgOpacitySlider').oninput=function(){const v=this.value/100;document.getElementById('opacityValue').textContent=this.value+'%';const bg=document.querySelector('.bg-image');if(bg)bg.style.opacity=v;localStorage.setItem('miku-bg-opacity',v)};
    document.getElementById('bgBlurSlider').oninput=function(){const v=parseInt(this.value,10);document.getElementById('blurValue').textContent=v>0?v+'px':'None';const bg=document.querySelector('.bg-image');if(bg)bg.style.filter=v>0?'blur('+v+'px)':'none';localStorage.setItem('miku-bg-blur',v)};

    loadSettings();

    document.querySelectorAll('.bg-preset').forEach(p => {
      p.onclick = () => {
        const bg = p.dataset.bg;
        if (bg === 'default') {
          setBackground('default');
        } else {
          setBackground(p.dataset.bg);
        }
      };
    });
    document.getElementById('closeModalBtn').onclick=()=>{document.getElementById('add-widget-modal').classList.remove('open');addModalOpen=false};
    document.getElementById('add-widget-modal').onclick=e=>{if(e.target.id==='add-widget-modal'){document.getElementById('add-widget-modal').classList.remove('open');addModalOpen=false}};
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
        if(!already)opt.onclick=()=>{const lay=loadLayout()||DEFAULT_LAYOUT.map(l=>({...l}));const defaults={};DEFAULT_LAYOUT.forEach(d=>defaults[d.id]=d);const dp=defaults[id]||{x:30+(lay.length%4)*260,y:130+Math.floor(lay.length/4)*240,w:220,h:null};lay.push({id,x:dp.x,y:dp.y,w:dp.w||220,h:dp.h||null,pinned:false});saveLayout(lay);modal.classList.remove('open');addModalOpen=false;renderWidgets()};
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