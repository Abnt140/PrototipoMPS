const chave_db = 'mps_tb_usuario'
const chave_posts = 'mps_posts'
const chave_sessao = 'mps_sessao'

let usuario_logado = null
let login_val_temp = ''
let provedor_social_temp = null

const posts_exemplo = [
  {
    id: 1,
    nome: 'usernameexemplo1',
    user: '@exemplo1',
    texto: 'Exemplo comentário de post',
    tempo: 'XX h',
    comentarios: 20,
    reposts: 675,
    likes: 3000,
    salvos: 79,
    tem_img: true
  }
]

function le_banco() {
  try { return JSON.parse(localStorage.getItem(chave_db)) || [] }
  catch { return [] }
}

function salva_banco(lista) {
  localStorage.setItem(chave_db, JSON.stringify(lista))
}

function hash_senha(s) {
  let hash = 0
  for (let i = 0; i < s.length; i++) {
    hash = ((hash << 5) - hash) + s.charCodeAt(i)
    hash |= 0
  }
  return 'h_' + Math.abs(hash).toString(36) + '_' + s.length
}

function email_existe(email) {
  return le_banco().some(u => u.email === email.toLowerCase())
}

function user_existe(user) {
  return le_banco().some(u => u.username === user.toLowerCase())
}

function insere_usuario(novo) {
  let lista = le_banco()
  lista.push({ ...novo, id: Date.now() })
  salva_banco(lista)
}

function busca_usuario(login_val) {
  return le_banco().find(u => u.email === login_val.toLowerCase() || u.username === login_val.toLowerCase()) || null
}

function salva_sessao(user) {
  localStorage.setItem(chave_sessao, JSON.stringify(user))
}

function le_sessao() {
  try { return JSON.parse(localStorage.getItem(chave_sessao)) }
  catch { return null }
}

function limpa_sessao() {
  localStorage.removeItem(chave_sessao)
}

function le_posts() {
  try {
    let p = JSON.parse(localStorage.getItem(chave_posts))
    return p && p.length ? p : posts_exemplo
  } catch { return posts_exemplo }
}

function salva_posts(lista) {
  localStorage.setItem(chave_posts, JSON.stringify(lista))
}

function irPasso(de, para) {
  document.getElementById(de).classList.remove('active')
  document.getElementById(para).classList.add('active')
}

function irCadastro() {
  document.getElementById('uc-badge').textContent = 'UC_01 — Cadastro'
  document.querySelectorAll('.step').forEach(s => s.classList.remove('active'))
  document.getElementById('step1').classList.add('active')
}

function irRecuperacao() {
  document.querySelectorAll('.step').forEach(s => s.classList.remove('active'))
  document.getElementById('step-recuperacao').classList.add('active')
}

function checaLoginVal() {
  let val = pega('inp-login-val')
  let btn = document.getElementById('btn-continuar-login')
  if (val.length > 0) {
    btn.disabled = false
    btn.classList.add('ativo')
  } else {
    btn.disabled = true
    btn.classList.remove('ativo')
  }
  limpaMsgErro(document.getElementById('inp-login-val'))
}

function irParaSenha() {
  let val = pega('inp-login-val')
  if (!val) {
    marcaErro('inp-login-val', 'err-login-val', 'Informe o e-mail ou username.')
    return
  }
  let user = busca_usuario(val)
  if (!user) {
    marcaErro('inp-login-val', 'err-login-val', 'UC_02_M_01: Usuário não encontrado.')
    return
  }
  login_val_temp = val
  document.querySelectorAll('.step').forEach(s => s.classList.remove('active'))
  document.getElementById('step-senha-login').classList.add('active')
  document.getElementById('uc-badge').textContent = 'UC_02 — Login'
}

function checaSenhaLogin() {
  let val = document.getElementById('inp-senha-login').value
  let btn = document.getElementById('btn-fazer-login')
  if (val.length > 0) {
    btn.disabled = false
    btn.classList.add('ativo')
  } else {
    btn.disabled = true
    btn.classList.remove('ativo')
  }
  limpaMsgErro(document.getElementById('inp-senha-login'))
}

function fazerLogin() {
  let senha = document.getElementById('inp-senha-login').value
  if (!senha) {
    marcaErro('inp-senha-login', 'err-senha-login', 'Informe a senha.')
    return
  }
  let user = busca_usuario(login_val_temp)
  if (!user) {
    marcaErro('inp-senha-login', 'err-senha-login', 'UC_02_M_01: Usuário não encontrado.')
    return
  }
  if (user.senha !== hash_senha(senha)) {
    marcaErro('inp-senha-login', 'err-senha-login', 'UC_02_M_01: Senha incorreta.')
    return
  }
  if (user.status === 'suspenso') {
    marcaErro('inp-senha-login', 'err-senha-login', 'UC_02_M_01: Conta suspensa.')
    return
  }
  usuario_logado = user
  salva_sessao(user)
  entrarNoFeed()
}

const contas_sociais_demo = {
  google: {
    nome_perfil: 'Usuário Google',
    username: 'usuario_google_demo',
    email: 'usuario.google.demo@gmail.com',
    provedor: 'google',
    icone: 'G',
    titulo: 'Entrar com Google'
  },
  apple: {
    nome_perfil: 'Usuário Apple',
    username: 'usuario_apple_demo',
    email: 'usuario.apple.demo@icloud.com',
    provedor: 'apple',
    icone: '',
    titulo: 'Entrar com Apple'
  }
}

function loginGoogle() {
  abrirLoginSocial('google')
}

function loginApple() {
  abrirLoginSocial('apple')
}

function abrirLoginSocial(provedor) {
  let conta = contas_sociais_demo[provedor]
  if (!conta) return

  provedor_social_temp = provedor

  document.getElementById('social-titulo').textContent = conta.titulo
  document.getElementById('social-icone').textContent = conta.icone
  document.getElementById('social-avatar').textContent = conta.icone
  document.getElementById('social-nome').textContent = conta.nome_perfil
  document.getElementById('social-email').textContent = conta.email

  let modal = document.getElementById('social-login-modal')
  modal.classList.remove('escondido')
  modal.setAttribute('aria-hidden', 'false')
}

function fecharLoginSocial() {
  let modal = document.getElementById('social-login-modal')
  if (!modal) return
  modal.classList.add('escondido')
  modal.setAttribute('aria-hidden', 'true')
}

function confirmarLoginSocial() {
  let conta = contas_sociais_demo[provedor_social_temp]
  if (!conta) return

  let usuarioDemo = {
    id: 'demo-' + conta.provedor,
    nome_perfil: conta.nome_perfil,
    username: conta.username,
    email: conta.email,
    tel: null,
    data_nasc: null,
    senha: null,
    status: 'ativo',
    provedor: conta.provedor,
    login_demo: true
  }

  usuario_logado = usuarioDemo
  salva_sessao(usuarioDemo)
  fecharLoginSocial()
  mostraToast('Login com ' + (conta.provedor === 'google' ? 'Google' : 'Apple') + ' realizado em modo demonstração.', false)
  entrarNoFeed()
}

function fazerRecuperacao() {
  let email = pega('inp-rec-email')
  if (!email || !email.includes('@')) {
    marcaErro('inp-rec-email', 'err-rec', 'Informe um e-mail válido.')
    return
  }
  let existe = le_banco().some(u => u.email === email.toLowerCase())
  if (!existe) {
    marcaErro('inp-rec-email', 'err-rec', 'UC_02_M_02: E-mail não encontrado.')
    return
  }
  mostraToast('E-mail de recuperação enviado (simulado). recuperarSenha(email): void', false)
  setTimeout(() => irPasso('step-recuperacao', 'step0'), 2000)
}

function validaPasso1() {
  let nome  = pega('inp-nome')
  let user  = pega('inp-user')
  let email = pega('inp-email')
  let nasc  = pega('inp-nasc')
  let ok = true

  if (!nome) { marcaErro('inp-nome', 'err-nome', 'Informe seu nome de perfil.'); ok = false }

  if (!/^[a-zA-Z0-9_]{4,15}$/.test(user)) {
    marcaErro('inp-user', 'err-user', 'Mínimo 4 caracteres. Apenas letras, números e _.'); ok = false
  } else if (user_existe(user)) {
    marcaErro('inp-user', 'err-user', 'Username já em uso.'); ok = false
  }

  if (!email || !email.includes('@') || !email.includes('.')) {
    marcaErro('inp-email', 'err-email', 'Informe um e-mail válido.'); ok = false
  } else if (email_existe(email)) {
    marcaErro('inp-email', 'err-email', 'UC_01_M_01 — E-mail já cadastrado.')
    mostraToast('UC_01_M_01: E-mail já vinculado a outra conta.', true); ok = false
  }

  if (nasc) {
    let partes = nasc.split('/')
    if (partes.length === 3) {
      let d = new Date(`${partes[2]}-${partes[1]}-${partes[0]}`)
      let idade = (Date.now() - d) / (365.25 * 24 * 3600 * 1000)
      if (isNaN(d.getTime()) || idade < 13) {
        marcaErro('inp-nasc', 'err-nasc', 'Data inválida ou idade mínima de 13 anos.'); ok = false
      }
    } else {
      marcaErro('inp-nasc', 'err-nasc', 'Formato: DD/MM/AAAA'); ok = false
    }
  } else {
    marcaErro('inp-nasc', 'err-nasc', 'Informe sua data de nascimento.'); ok = false
  }

  if (ok) irPasso('step1', 'step2')
}

function validaPasso2() {
  let senha = document.getElementById('inp-senha').value
  let conf  = document.getElementById('inp-conf').value
  let ok = true

  if (senha.length < 8) { marcaErro('inp-senha', 'err-senha', 'Mínimo de 8 caracteres.'); ok = false }
  if (senha !== conf)   { marcaErro('inp-conf', 'err-conf', 'As senhas não coincidem.'); ok = false }
  if (!ok) return

  let btn = document.querySelector('#step2 .btn')
  btn.disabled = true
  btn.textContent = 'Criando conta…'

  setTimeout(() => {
    let novo = {
      nome_perfil: pega('inp-nome'),
      username:    pega('inp-user'),
      email:       pega('inp-email').toLowerCase(),
      tel:         pega('inp-tel') || null,
      data_nasc:   pega('inp-nasc'),
      senha:       hash_senha(senha),
      status:      'ativo'
    }
    insere_usuario(novo)
    mostraToast('Conta criada! Faça login para continuar.', false)

    setTimeout(() => {
      btn.disabled = false
      btn.textContent = 'Continuar'
      voltarParaLogin()
    }, 1200)
  }, 1000)
}

function voltarParaLogin() {
  fecharLoginSocial()
  document.getElementById('tela-feed').style.display = 'none'
  document.getElementById('tela-auth').style.display = 'flex'
  document.getElementById('uc-badge').textContent = 'UC_02 — Login'

  document.querySelectorAll('.step').forEach(s => s.classList.remove('active'))
  document.getElementById('step0').classList.add('active')

  document.getElementById('inp-login-val').value = ''
  document.getElementById('inp-senha-login').value = ''
  document.getElementById('btn-continuar-login').disabled = true
  document.getElementById('btn-continuar-login').classList.remove('ativo')
  document.getElementById('btn-fazer-login').disabled = true
  document.getElementById('btn-fazer-login').classList.remove('ativo')
  login_val_temp = ''
}

function sairParaLogin() {
  usuario_logado = null
  limpa_sessao()
  voltarParaLogin()
  mostraToast('Você voltou para a tela de login.', false)
}

function entrarNoFeed() {
  document.getElementById('tela-auth').style.display = 'none'
  document.getElementById('tela-feed').style.display = 'flex'
  document.getElementById('uc-badge').textContent = 'UC_07 — Feed'
  atualizaFeed()
  if (usuario_logado) {
    document.getElementById('nav-perfil').innerHTML = `
      <div style="width:22px;height:22px;border-radius:50%;background:linear-gradient(135deg,#f9ca24,#6c5ce7);display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;flex-shrink:0">${usuario_logado.nome_perfil.charAt(0).toUpperCase()}</div>
      Perfil
    `
  }
}

function atualizaFeed() {
  let lista = le_posts()
  let container = document.getElementById('lista-posts')
  container.innerHTML = lista.map(p => renderPost(p)).join('')
}

function renderPost(p) {
  let ini = p.nome ? p.nome.charAt(0).toUpperCase() : '?'
  let likes_fmt = p.likes >= 1000 ? (p.likes/1000).toFixed(0) + ' mil' : p.likes
  let reps_fmt = p.reposts >= 1000 ? (p.reposts/1000).toFixed(0) + ' mil' : p.reposts

  let img_html = p.tem_img ? `
    <div style="background:#1a1a1a;border-radius:14px;margin-bottom:10px;overflow:hidden;min-height:200px;display:flex;align-items:center;justify-content:center;flex-direction:column;gap:12px;padding:20px;border:1px solid var(--borda)">
      <div style="font-size:18px;color:#e7e9ea;font-style:italic">if you dance</div>
      <div style="display:flex;gap:20px;font-size:48px;">🐊 🐊</div>
    </div>
  ` : ''

  let data_html = p.data ? `<div class="post-time-full">${p.data}</div>` : ''

  return `
    <div class="post">
      <div class="post-avatar" style="background:#4a4a6a;">${ini}</div>
      <div class="post-body">
        <div class="post-header">
          <span class="post-nome">${p.nome}</span>
          <span class="post-user">${p.user}</span>
          <span class="post-user">·</span>
          <span class="post-tempo">${p.tempo}</span>
        </div>
        <div class="post-texto">${p.texto}</div>
        ${img_html}
        ${data_html}
        <div class="post-acoes">
          <span class="post-acao" onclick="this.style.color='var(--azul)'">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z"/></svg>
            ${p.comentarios}
          </span>
          <span class="post-acao rep" onclick="this.style.color='#00ba7c'">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M7 7h10v3l4-4-4-4v3H5v6h2V7zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2v4z"/></svg>
            ${reps_fmt}
          </span>
          <span class="post-acao like" onclick="this.style.color='#f91880'">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M12 21.638h-.014C9.403 21.59 1.95 14.856 1.95 8.478c0-3.064 2.525-5.754 5.403-5.754 2.29 0 3.83 1.58 4.646 2.73.814-1.148 2.354-2.73 4.645-2.73 2.88 0 5.404 2.69 5.404 5.755 0 6.376-7.454 13.11-10.037 13.157H12z"/></svg>
            ${likes_fmt}
          </span>
          <span class="post-acao">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M17 3H7c-1.1 0-2 .9-2 2v16l7-3 7 3V5c0-1.1-.9-2-2-2z"/></svg>
            ${p.salvos}
          </span>
        </div>
      </div>
    </div>
  `
}

function checaComposer() {
  let val = document.getElementById('composer-input').value
  let btn = document.getElementById('btn-postar')
  btn.disabled = val.trim().length === 0
}

function abrirComposer() {
  document.getElementById('composer-input').focus()
}

function postarTweet() {
  let texto = document.getElementById('composer-input').value.trim()
  if (!texto) return
  let user = usuario_logado || { nome_perfil: 'Você', username: '@voce' }
  let now = new Date()
  let hrs = now.getHours().toString().padStart(2,'0')
  let min = now.getMinutes().toString().padStart(2,'0')
  let ampm = now.getHours() >= 12 ? 'PM' : 'AM'
  let dia = now.toLocaleDateString('pt-BR')
  let novo_post = {
    id: Date.now(),
    nome: user.nome_perfil,
    user: '@' + user.username,
    texto: texto,
    tempo: 'agora',
    data: `${hrs}:${min} ${ampm} | ${dia}`,
    comentarios: 0,
    reposts: 0,
    likes: 0,
    salvos: 0,
    tem_img: false
  }
  let lista = le_posts()
  lista.unshift(novo_post)
  salva_posts(lista)
  document.getElementById('composer-input').value = ''
  document.getElementById('btn-postar').disabled = true
  atualizaFeed()
  mostraToast('Post publicado!', false)
}

function pega(id) {
  return document.getElementById(id).value.trim()
}

function marcaErro(id_input, id_err, msg) {
  let inp = document.getElementById(id_input)
  inp.classList.add('erro')
  let err = document.getElementById(id_err)
  err.textContent = msg
  err.classList.add('visivel')
}

function limpaMsgErro(el) {
  el.classList.remove('erro')
  let prox = el.parentElement.querySelector('.msg-erro')
  if (prox) prox.classList.remove('visivel')
}

function mascaraData(el) {
  let v = el.value.replace(/\D/g, '')
  if (v.length > 2) v = v.slice(0,2) + '/' + v.slice(2)
  if (v.length > 5) v = v.slice(0,5) + '/' + v.slice(5,9)
  el.value = v
}

function mascaraTel(el) {
  let v = el.value.replace(/\D/g, '')
  let r = ''
  if (v.length > 0) r = '+' + v.slice(0,2)
  if (v.length > 2) r += ' (' + v.slice(2,4)
  if (v.length > 4) r += ') ' + v.slice(4,9)
  if (v.length > 9) r += '-' + v.slice(9,13)
  el.value = r
}

let timer_toast

function mostraToast(msg, eh_erro) {
  let t = document.getElementById('toast')
  t.textContent = msg
  t.className = 'visivel' + (eh_erro ? ' toast-erro' : '')
  clearTimeout(timer_toast)
  timer_toast = setTimeout(() => t.className = '', 3200)
}

document.addEventListener('keydown', e => {
  if (e.key !== 'Enter') return
  let s0 = document.getElementById('step0')
  let ss = document.getElementById('step-senha-login')
  let s1 = document.getElementById('step1')
  let s2 = document.getElementById('step2')
  let sr = document.getElementById('step-recuperacao')
  if (s0.classList.contains('active')) irParaSenha()
  if (ss.classList.contains('active')) fazerLogin()
  if (s1.classList.contains('active')) validaPasso1()
  if (s2.classList.contains('active')) validaPasso2()
  if (sr.classList.contains('active')) fazerRecuperacao()
})

let sessao = le_sessao()
if (sessao) {
  usuario_logado = sessao
  entrarNoFeed()
}
