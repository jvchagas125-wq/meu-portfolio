// ============================================================
//  CONFIGURAÇÃO DO PAINEL — preencha UMA vez e envie ao GitHub
//  Passo a passo completo: veja o arquivo CONFIGURAR-PAINEL.md
// ============================================================

// 1) Cole aqui os dados do seu app web no Firebase
//    (Console do Firebase > Configurações do projeto > Seus apps > Configuração do SDK)
//    Essas chaves podem ficar públicas: quem protege os dados são as regras do Firestore.
export const FIREBASE_CONFIG = {
  apiKey: "AIzaSyBHfxOFVnw2EdXc3jP1bJ_OoMiESzYICdg",
  authDomain: "meu-portfolio-ccb4f.firebaseapp.com",
  projectId: "meu-portfolio-ccb4f",
  storageBucket: "meu-portfolio-ccb4f.firebasestorage.app",
  messagingSenderId: "170413489866",
  appId: "1:170413489866:web:4410db42685fb033b37e33"
};

// 2) Cloudinary (já preenchido com os seus dados)
export const CLOUDINARY = {
  cloudName: "dcvhqnr1c",
  uploadPreset: "meu-portfolio"
};

// 3) O usuário "jvdev2026" entra no Firebase como jvdev2026@jvdev.app
//    (é só um nome interno; esse e-mail não precisa existir de verdade).
export const ADMIN_EMAIL_DOMAIN = "jvdev.app";
