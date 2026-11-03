(function () {
'use strict';
const $=(q,r=document)=>r.querySelector(q), $$=(q,r=document)=>[...r.querySelectorAll(q)];
const out=$('#conteudo'), root=document.documentElement;
const esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const norm=x=>String(x??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
const slug=x=>norm(x).replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
const storage={get(k,d){try{return JSON.parse(localStorage.getItem('jm2:'+k))??d}catch{return d}},set(k,v){try{localStorage.setItem('jm2:'+k,JSON.stringify(v));return true}catch{return false}}};
let items=storage.get('artigos',BASE.map(x=>({...x,publicado:true}))), vote=storage.get('voto',null), editing=null;
let prefs=storage.get('acessibilidade',{size:100,contrast:false});
const published=()=>items.filter(x=>x.publicado).sort((a,b)=>b.data.localeCompare(a.data));
const date=x=>new Intl.DateTimeFormat('pt-BR',{dateStyle:'long',timeZone:'UTC'}).format(new Date(x+'T12:00:00Z'));
const today=()=>new Intl.DateTimeFormat('sv-SE',{timeZone:'America/Belem'}).format(new Date());
$('#data').textContent=new Intl.DateTimeFormat('pt-BR',{dateStyle:'full',timeZone:'America/Belem'}).format(new Date());
const a=(name,url)=>`<a href="#/${url}">${esc(name)}</a>`;
const options=(names,selected='')=>names.map(x=>`<option${x===selected?' selected':''}>${esc(x)}</option>`).join('');
const categories=EDITORIAS.filter(x=>x!=='Colunistas');
const categoryLinks=names=>names.map(x=>a(x,'editoria/'+slug(x))).join('');
const columnLinks=()=>COLUNAS.map(x=>a(x,'coluna/'+slug(x))).join('');
$('#editorias').innerHTML=categoryLinks(EDITORIAS);
$('#rodape').innerHTML=`<div class="wrap">${$('.brand').outerHTML}<div class="footer-grid"><section><h2>Editorias</h2>${categoryLinks(categories)}</section><section><h2>Colunistas</h2>${columnLinks()}</section><section><h2>Portal</h2>${a('Edições em PDF','edicoes')}${a('Busca','busca')}${a('Arquivo','arquivo')}${a('Fale Conosco / Anuncie','contato')}${a('Privacidade','privacidade')}</section><section><h2>Jornal Marabá</h2>${a('Quem Somos','quem-somos')}${a('Painel demonstrativo','painel')}</section></div><p class="end">Jornal Marabá · Protótipo para entrevista</p></div>`;
const notice=t=>{const n=$('#aviso');n.textContent=t;clearTimeout(notice.timer);notice.timer=setTimeout(()=>n.textContent='',3200)};
function applyPrefs(){root.style.fontSize=prefs.size+'%';root.toggleAttribute('data-contrast',prefs.contrast);$('#contraste').setAttribute('aria-pressed',String(prefs.contrast));$('#mais').disabled=prefs.size>=125;$('#menos').disabled=prefs.size<=90;storage.set('acessibilidade',prefs)}
$('#mais').onclick=()=>{prefs.size=Math.min(125,prefs.size+5);applyPrefs()};
$('#menos').onclick=()=>{prefs.size=Math.max(90,prefs.size-5);applyPrefs()};
$('#contraste').onclick=()=>{prefs.contrast=!prefs.contrast;applyPrefs()};
applyPrefs();
const image=(file,alt)=>`<img src="midia/${esc(file)}" alt="${esc(alt)}" loading="lazy">`;
const ad=(label='Anuncie aqui')=>`<div class="ad-box"><span><strong>Publicidade</strong><br>${esc(label)}</span></div>`;
const empty=(t='Nenhuma matéria publicada nesta seção.')=>`<p class="placeholder">${esc(t)}</p>`;
function card(p,heading=true){return `<article class="card">${heading?`<span class="overline">${esc(p.editoria)}</span>`:''}<h3>${a(p.titulo,'materia/'+p.id)}</h3><a href="#/materia/${esc(p.id)}" tabindex="-1" aria-hidden="true">${p.foto?image(p.foto,''):`<span class="placeholder">${esc(p.editoria)}</span>`}</a><p>${esc(p.resumo)}</p><p class="meta">${date(p.data)} · ${esc(p.autor)}</p>${a('Ler matéria','materia/'+p.id)}</article>`}
const cards=ps=>ps.length?`<div class="card-grid">${ps.map(p=>card(p)).join('')}</div>`:empty();
const title=(t,sub='')=>`<div class="overline">Jornal Marabá</div><h1>${esc(t)}</h1>${sub?`<p class="intro">${esc(sub)}</p>`:''}`;
const page=html=>`<section class="page">${html}</section>`;
const section=(t,html)=>`<section class="section"><h2 class="section-title">${esc(t)}</h2>${html}</section>`;
const btn=(name,cl='')=>`<button type="button" class="button ${cl}">${esc(name)}</button>`;
function home(){
 const ps=published(), top=e=>ps.find(p=>p.editoria===e), col=e=>section(e,top(e)?card(top(e),false):empty());
 return `<h1 class="skip">Jornal Marabá</h1><div class="ad-top"><div><span class="tag">Publicidade · Mercado local</span>${image('mercado.jpg','O Sacolão: precinho, variedade e qualidade é aqui!')}</div><aside><span class="tag">Comércio local</span><p>Prestigie os negócios do seu bairro.</p>${a('Anuncie no Jornal Marabá','contato')}</aside></div>
 <div class="popular"><div class="media"><span class="signal" aria-hidden="true">♬</span>Rádio Marabá<small>Em breve</small></div><section id="enquete" class="poll"></section><div class="media"><span class="signal" aria-hidden="true">▣</span>TV Marabá<small>Em breve</small></div></div>
 <div class="section">${ad('Espaço para banner horizontal')}</div>
 <div class="home-grid"><section><h2 class="section-title">Edição impressa</h2><div class="paper-card"><a class="paper-cta" href="#/edicoes">Leia a edição em PDF</a><a href="#/edicoes" aria-label="Consultar edição de amostra">${image('capa.jpg','Capa de referência do Jornal Marabá')}</a></div></section><section><h2 class="section-title">Cidadania</h2>${top('Cidadania')?card(top('Cidadania'),false):empty()}</section><section><h2 class="section-title">Comércio</h2>${top('Comércio')?card(top('Comércio'),false):empty()}</section><aside>${ad('Espaço publicitário lateral')}${image('image26.png','Anúncio de referência: cursos PAVA')}</aside></div>
 <div class="banner-strip">${image('image27.png','Prestigie o comércio local. Faça compras no seu bairro.')}</div>
 ${section('Últimas notícias',cards(ps.slice(0,6)))}
 <div class="category-grid">${['Notícias','Política','Saúde','Veículos','Condomínios','Empregos','Imóveis','Fala o Povo'].map(col).join('')}</div>`;
}
function renderPoll(){
 const block=$('#enquete');
 const ratings=['Bom','Razoável','Ruim'];
 const tally=()=>`<details class="results"><summary>Ver resultados</summary><p><strong>Resultados de demonstração</strong> · simulação com o voto deste navegador.</p>
 <p>Avaliação da Câmara</p><ul>${ratings.map((x,i)=>`<li>${x}: ${[17,9,4][i]+Number(vote?.avaliacao===x)}</li>`).join('')}</ul>
 <p>Vereadores selecionados</p><ul>${VEREADORES.map((x,i)=>`<li>${esc(x)}: ${[4,3,2,2,1][i%5]+Number(vote?.escolhas.includes(x)??false)}</li>`).join('')}</ul>
 <p>Destaque do mandato</p><ul>${VEREADORES.map((x,i)=>`<li>${esc(x)}: ${[3,2,1,1,0][i%5]+Number(vote?.destaque===x)}</li>`).join('')}</ul></details>`;
 block.innerHTML=`<h2 class="poll-title">Pesquisa Popular</h2>${vote?'<p role="status">Seu voto demonstrativo foi registrado.</p>':`<form><fieldset><legend>Como você avalia o desempenho da Câmara de Marabá?</legend><div class="rating">${ratings.map(x=>`<label><input type="radio" name="avaliacao" value="${x}" required> ${x}</label>`).join('')}</div></fieldset><details><summary id="count">Escolha de 1 a 5 vereadores</summary><div class="choices">${VEREADORES.map(x=>`<label><input type="checkbox" value="${esc(x)}"> ${esc(x)}</label>`).join('')}</div></details><label>Dentre os escolhidos, quem é o destaque?<select required name="destaque"><option value="">Selecione o destaque</option></select></label><div><button class="button">Votar</button> <small>Enquete demonstrativa</small></div><small id="poll-error" role="alert"></small></form>`}${tally()}`;
 if(vote)return;
 const form=$('form',block), boxes=$$('input[type=checkbox]',form), select=$('select',form);
 const picks=()=>boxes.filter(x=>x.checked).map(x=>x.value);
 boxes.forEach(box=>box.onchange=()=>{
   if(picks().length>5){box.checked=false;$('#poll-error').textContent='Você pode escolher até 5 vereadores.';return}
   const prev=select.value, list=picks();
   select.innerHTML='<option value="">Selecione o destaque</option>'+options(list,prev);
   $('#count').textContent=list.length?`Vereadores selecionados: ${list.length} de 5`:'Escolha de 1 a 5 vereadores';
   $('#poll-error').textContent='';
 });
 form.onsubmit=e=>{
   e.preventDefault();
   const escolhas=picks(), destaque=select.value;
   if(!escolhas.length||escolhas.length>5||!escolhas.includes(destaque)){ $('#poll-error').textContent='Selecione de 1 a 5 vereadores e escolha um destaque entre eles.';return }
   vote={avaliacao:new FormData(form).get('avaliacao'),escolhas,destaque};if(!storage.set('voto',vote))notice('O navegador não permitiu salvar o voto.');renderPoll();$('.results',block).open=true;$('summary',block).focus();
 };
}
function article(p){
 const url=encodeURIComponent(location.href), desc=encodeURIComponent(p.titulo);
 const related=published().filter(x=>x.id!==p.id&&x.editoria===p.editoria).slice(0,3);
 return page(`<article class="article"><p class="crumb">${a('Home','')} / ${a(p.editoria,'editoria/'+slug(p.editoria))}</p><span class="overline">${esc(p.editoria)}</span><h1>${esc(p.titulo)}</h1><p class="intro">${esc(p.resumo)}</p><p class="by">Por ${esc(p.autor)} · ${date(p.data)} · Conteúdo demonstrativo</p>${p.foto?`<figure>${image(p.foto,p.alt)}<figcaption>${esc(p.credito)}</figcaption></figure>`:''}
 <div class="actions"><button class="button secondary" id="copiar">Copiar link</button><a class="button secondary" target="_blank" rel="noopener noreferrer" href="https://wa.me/?text=${desc}%20${url}">WhatsApp</a><a class="button secondary" href="mailto:?subject=${desc}&amp;body=${url}">E-mail</a>${'speechSynthesis' in window?'<button class="button secondary" id="audio">Ouvir matéria</button>':''}</div>
 <div class="article-body">${p.corpo.split(/\n\s*\n/).filter(Boolean).map(t=>`<p>${esc(t).replace(/\n/g,'<br>')}</p>`).join('')}</div>${ad()}${related.length?section('Leia também',cards(related)):''}</article>`);
}
function articleEvents(p){
 $('#copiar').onclick=async()=>{try{await navigator.clipboard.writeText(location.href);notice('Link copiado.')}catch{const el=document.createElement('textarea');el.value=location.href;document.body.append(el);el.select();const ok=document.execCommand('copy');el.remove();if(ok)notice('Link copiado.');else window.prompt('Copie o link da matéria:',location.href)}};
 const audio=$('#audio');
 if(audio)audio.onclick=()=>{if(speechSynthesis.speaking){speechSynthesis.cancel();audio.textContent='Ouvir matéria';return}const speech=new SpeechSynthesisUtterance(p.titulo+'. '+p.corpo);speech.lang='pt-BR';audio.textContent='Parar leitura';speech.onend=speech.onerror=()=>{audio.textContent='Ouvir matéria'};speechSynthesis.speak(speech)};
}
function browse(search,query=''){
 out.innerHTML=page(title(search?'Busca':'Arquivo de matérias',search?'Encontre matérias por título, resumo ou editoria.':'Explore as publicações por editoria e data.')+`<form class="form" id="filtros"><div class="form-row">${search?`<label>Buscar matérias<input type="search" id="consulta" value="${esc(query)}" placeholder="Ex.: Cidadania"></label>`:`<label>Editoria<select id="filtro-editoria"><option value="">Todas</option>${options(categories)}</select></label><label>Ordenação<select id="ordenacao"><option value="recentes">Mais recentes</option><option value="antigas">Mais antigas</option></select></label>`}</div>${search?'<div><button class="button">Buscar</button></div>':''}</form><p id="quantidade" class="subtle" role="status"></p><div id="lista"></div>`);
 const show=()=>{let data=published();if(search){const tokens=norm($('#consulta').value).trim().split(/\s+/).filter(Boolean);data=data.filter(p=>tokens.every(t=>norm(p.titulo+' '+p.resumo+' '+p.editoria).includes(t)))}else{const c=$('#filtro-editoria').value;if(c)data=data.filter(p=>p.editoria===c);if($('#ordenacao').value==='antigas')data.reverse()}$('#quantidade').textContent=`${data.length} ${data.length===1?'matéria encontrada':'matérias encontradas'}`;$('#lista').innerHTML=data.length?cards(data):empty('Nenhuma matéria corresponde aos filtros.')};
 $('#filtros').onsubmit=e=>{e.preventDefault();show()};
 $('#filtros').addEventListener(search?'input':'change',show);show();
}
function contact(){
 out.innerHTML=page(title('Fale Conosco','Envie uma sugestão de pauta, entre em contato sobre publicidade ou fale com a redação. Use dados fictícios nesta demonstração.')+`<form class="form" id="contato-form"><div class="form-row"><label>Nome <input name="nome" required autocomplete="off"></label><label>E-mail <input name="email" type="email" required autocomplete="off"></label></div><div class="form-row"><label>WhatsApp (opcional)<input name="whatsapp" type="tel" autocomplete="off" placeholder="(DDD) número"></label><label>Estado<select id="estado" required><option value="">Selecione</option>${options(['Acre','Alagoas','Amapá','Amazonas','Bahia','Ceará','Distrito Federal','Espírito Santo','Goiás','Maranhão','Mato Grosso','Mato Grosso do Sul','Minas Gerais','Pará','Paraíba','Paraná','Pernambuco','Piauí','Rio de Janeiro','Rio Grande do Norte','Rio Grande do Sul','Rondônia','Roraima','Santa Catarina','São Paulo','Sergipe','Tocantins'])}</select></label></div><label id="municipio-label" hidden>Município do Pará<input name="municipio" id="municipio" placeholder="Ex.: Marabá" autocomplete="off"></label><label>Assunto<select id="assunto" required><option value="">Selecione</option>${options(['Publicidade','Sugerir pautas','Fazer denúncia','Elogios'])}</select></label><label id="editoria-label" hidden>Editoria<select id="contato-editoria"><option value="">Selecione</option>${options([...categories,'Eventos'])}</select></label><label>Mensagem<textarea name="mensagem" required maxlength="2500"></textarea></label><div><button class="button">Testar envio</button></div><p id="contato-resultado" role="status"></p></form>`);
 const form=$('#contato-form');
 $('#estado').onchange=e=>{const pa=e.target.value==='Pará';$('#municipio-label').hidden=!pa;$('#municipio').required=pa};
 $('#assunto').onchange=e=>{const show=!!e.target.value&&e.target.value!=='Publicidade';$('#editoria-label').hidden=!show;$('#contato-editoria').required=show};
 form.onsubmit=e=>{e.preventDefault();$('#contato-resultado').textContent='Envio simulado com sucesso. Nenhum dado foi transmitido ou armazenado.';form.reset();$('#estado').onchange({target:$('#estado')});$('#assunto').onchange({target:$('#assunto')})};
}
const demoAccounts = [
  { user: 'editor', password: 'Editor123!', name: 'Editor de teste', canPublish: true },
  { user: 'reporter', password: 'Reporter123!', name: 'Repórter de teste', canPublish: false }
];
let currentAccount = demoAccounts.find(account => account.user === storage.get('conta-demo', ''));
function showDemoLogin() {
  out.innerHTML = page(title('Entrar no painel editorial', 'Use uma conta de demonstração. O acesso e as alterações ficam neste navegador.') + `
    <form class="form" id="demo-login">
      <label>Usuário<input name="usuario" required autocomplete="username" autocapitalize="none"></label>
      <label>Senha<input type="password" name="senha" required autocomplete="current-password"></label>
      <div><button class="button">Entrar</button></div>
      <p id="login-error" role="alert"></p>
    </form>`);
  $('#demo-login').onsubmit = event => {
    event.preventDefault();
    const fields = new FormData(event.currentTarget);
    const user = String(fields.get('usuario')).trim().toLowerCase();
    const password = fields.get('senha');
    const account = demoAccounts.find(entry => entry.user === user && entry.password === password);
    if (!account) {
      $('#login-error').textContent = 'Usuário ou senha inválidos.';
      return;
    }
    currentAccount = account;
    storage.set('conta-demo', account.user);
    panel();
    out.focus();
  };
}
function panel(focus=false){
 if (!currentAccount) {
  showDemoLogin();
  return;
 }
 if (!currentAccount.canPublish && items.find(item => item.id === editing)?.publicado) editing = null;
 const p=items.find(x=>x.id===editing);
 out.innerHTML=page(title('Painel editorial','Ambiente demonstrativo. As mudanças são salvas somente neste navegador.')+`<h2 class="section-title" id="edicao-titulo">${p?'Editar matéria':'Nova matéria'}</h2><form class="form" id="editor-form"><label>Título<input required name="titulo" maxlength="170" value="${esc(p?.titulo)}"></label><label>Resumo<input required name="resumo" maxlength="250" value="${esc(p?.resumo)}"></label><div class="form-row"><label>Editoria<select name="editoria">${options(categories,p?.editoria)}</select></label><label>Autor<input name="autor" required value="${esc(p?.autor||'Redação')}" maxlength="80"></label></div><label>Conteúdo<textarea required name="corpo" maxlength="20000">${esc(p?.corpo)}</textarea></label><div class="actions"><button type="submit" value="salvar" class="button secondary">Salvar ${p?.publicado?'alterações':'rascunho'}</button><button type="submit" value="publicar" class="button">Publicar matéria</button>${p?'<button type="button" id="cancelar" class="button secondary">Cancelar edição</button>':''}</div></form><h2 class="section-title">Matérias cadastradas</h2><div class="panel-list">${items.map(x=>`<div class="panel-item"><div><strong>${esc(x.titulo)}</strong><p class="subtle">${esc(x.editoria)} · ${x.publicado?'Publicada':'Rascunho'}</p></div><div class="actions"><button class="button secondary" data-edit="${esc(x.id)}">Editar</button><button class="button secondary" data-toggle="${esc(x.id)}">${x.publicado?'Despublicar':'Publicar'}</button>${x.publicado?`<a class="button secondary" href="#/materia/${esc(x.id)}">Ver</a>`:''}</div></div>`).join('')}</div><p><button type="button" id="restaurar" class="button secondary">Restaurar dados de exemplo</button></p>`);
 out.insertAdjacentHTML('afterbegin', `<div class="actions" style="margin-top:16px"><span>${esc(currentAccount.name)} · ${currentAccount.canPublish?'Pode publicar':'Pode editar rascunhos'}</span><button id="sair" type="button" class="button secondary">Sair</button></div>`);
 $('#sair').onclick=()=>{
  currentAccount=undefined;
  editing=null;
  storage.set('conta-demo','');
  panel();
  $('#demo-login input').focus();
 };
 if (!currentAccount.canPublish) {
  $$('[data-toggle], button[value="publicar"], #restaurar',out).forEach(button=>button.remove());
  $$('[data-edit]',out).filter(button=>items.find(item=>item.id===button.dataset.edit)?.publicado).forEach(button=>button.remove());
 }
 const save=t=>{if(storage.set('artigos',items))notice(t);else notice('Alteração feita, mas o navegador não permitiu salvá-la.')};
 $('#editor-form').onsubmit=e=>{e.preventDefault();const fields=Object.fromEntries(new FormData(e.currentTarget));Object.keys(fields).forEach(k=>fields[k]=fields[k].trim());if(Object.values(fields).some(x=>!x)){notice('Preencha todos os campos.');return}
 if (!currentAccount.canPublish && p?.publicado) return;
 const publicar=currentAccount.canPublish && e.submitter?.value==='publicar', item={...(p||{id:'teste-'+Date.now().toString(36),data:today()}),...fields,publicado:publicar||Boolean(p?.publicado)};
 if(p)items=items.map(x=>x.id===p.id?item:x);else items=[item,...items];
 editing=null;save(publicar?'Matéria publicada.':'Matéria salva.');panel(true)};
 $$('[data-edit]',out).forEach(b=>b.onclick=()=>{editing=b.dataset.edit;panel(true)});
 $$('[data-toggle]',out).forEach(b=>b.onclick=()=>{const x=items.find(x=>x.id===b.dataset.toggle);x.publicado=!x.publicado;save(x.publicado?'Matéria publicada.':'Matéria despublicada.');panel();$('[data-toggle="'+x.id+'"]')?.focus()});
 if($('#cancelar'))$('#cancelar').onclick=()=>{editing=null;panel(true)};
 const restore=$('#restaurar');
 if (restore) restore.onclick=()=>{if(confirm('Restaurar as matérias de exemplo e apagar as alterações feitas neste painel?')){items=BASE.map(x=>({...x,publicado:true}));editing=null;save('Matérias de exemplo restauradas.');panel(true)}};
 if(focus)$('#editor-form input').focus();
}
function route(focus=false){
 if(location.hash==='#conteudo'){out.focus();return}
 if('speechSynthesis' in window)speechSynthesis.cancel();
 const path=location.hash.replace(/^#\/?/,'');
 const [raw,query='']=path.split('?'),[kind,id]=raw.split('/');
 const p=published().find(x=>x.id===id);
 document.title='Jornal Marabá';
 $$('#editorias a').forEach(el=>{if(el.getAttribute('href')==='#/'+raw)el.setAttribute('aria-current','page');else el.removeAttribute('aria-current')});
 if(!kind){out.innerHTML=home();renderPoll()}
 else if(kind==='busca'||kind==='arquivo')browse(kind==='busca',new URLSearchParams(query).get('q')||'');
 else if(kind==='materia'&&p){out.innerHTML=article(p);articleEvents(p)}
 else if(kind==='editoria'&&id==='colunistas')out.innerHTML=page(title('Colunistas','Conheça as colunas do Jornal Marabá.')+`<nav class="actions" aria-label="Colunas">${COLUNAS.map(x=>`<a class="button secondary" href="#/coluna/${slug(x)}">${esc(x)}</a>`).join('')}</nav>`);
 else if(kind==='editoria'||kind==='coluna'){
  const name=(kind==='editoria'?EDITORIAS:COLUNAS).find(x=>slug(x)===id);
  out.innerHTML=page(name?title(name)+cards(published().filter(x=>x[kind==='editoria'?'editoria':'coluna']===name))+`<div class="section">${ad('Banner retângulo · 300 × 250 px')}</div>`:title('Seção não encontrada'));
 }
 else if(kind==='edicoes')out.innerHTML=page(title('Edições em PDF')+`<article class="edition">${image('capa.jpg','Capa do Jornal Marabá utilizada como referência')}<div><h2>Edição de amostra</h2><p>Novembro de 2026</p><p>PDF demonstrativo criado a partir da capa fornecida. A edição oficial completa não foi disponibilizada.</p><a class="button" href="midia/edicao-amostra.pdf" target="_blank" rel="noopener">Ler edição</a></div></article>`);
 else if(kind==='contato')contact();
 else if(kind==='painel')panel();
 else if(kind==='quem-somos')out.innerHTML=page(title('Quem Somos','O Jornal Marabá é um projeto da Mídia Moderna Comunicação que reúne informação local, jornal impresso e portal de notícias.')+`<p class="intro">Informar, inspirar e conectar são compromissos do projeto com a cidadania, o comércio e as notícias de Marabá. Rádio e TV web fazem parte dos próximos passos previstos.</p><p class="intro">O portal abre espaço para sugestões de pauta e aproxima os leitores dos acontecimentos da cidade.</p>${a('Fale com a redação','contato')}`);
 else if(kind==='privacidade')out.innerHTML=page(title('Política de Privacidade','Informações sobre este protótipo de entrevista.')+`<p class="intro">Este protótipo usa armazenamento local para guardar o voto demonstrativo, as preferências de acessibilidade e as alterações nas matérias. Esses dados ficam no navegador e não são compartilhados entre dispositivos.</p><p class="intro">O formulário apenas simula o envio: suas entradas não são transmitidas nem armazenadas. Use dados fictícios nos testes. Os links de compartilhamento podem abrir serviços externos.</p><p class="intro">Para apagar os dados locais do protótipo, limpe os dados deste site no seu navegador.</p>`);
 else out.innerHTML=page(title('Página não encontrada','A página pode ter sido removida ou ainda não estar disponível.')+a('Voltar à home',''));
 const h=$('h1',out);if(kind&&h)document.title=h.textContent+' | Jornal Marabá';
 if(focus){window.scrollTo(0,0);out.focus({preventScroll:true})}
}
window.addEventListener('hashchange',()=>route(true));
window.addEventListener('storage',e=>{if(e.key==='jm2:artigos'){items=storage.get('artigos',BASE.map(x=>({...x,publicado:true})));route()}});
route();
})();
