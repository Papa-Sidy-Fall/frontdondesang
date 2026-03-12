export interface ChatbotAction {
  label: string;
  path: string;
}

export interface ChatbotReply {
  answer: string;
  note?: string;
  suggestions?: string[];
  actions?: ChatbotAction[];
}

interface ChatbotIntent extends ChatbotReply {
  id: string;
  keywords: string[];
}

const MEDICAL_NOTE =
  "Information generale uniquement. La decision finale de don appartient toujours a l'equipe medicale du centre. En cas de douleur importante, malaise, saignement ou symptomes graves, contactez rapidement un professionnel de sante ou le service d'urgence le plus proche.";

const CHATBOT_INTENTS: ChatbotIntent[] = [
  {
    id: "signup",
    keywords: ["inscription", "sinscrire", "creer un compte", "creer compte", "devenir donneur", "ouvrir compte"],
    answer:
      "Pour un donneur, l'inscription se fait dans l'interface DonSang en remplissant le formulaire avec le nom, le prenom, l'email, le mot de passe, le CNI, le telephone, la date de naissance, le groupe sanguin, la ville et le quartier. Le CNI et le numero servent a eviter les doublons.",
    suggestions: [
      "Comment me connecter ?",
      "Comment prendre un rendez-vous ?",
      "A quoi sert le CNI ?",
    ],
    actions: [{ label: "Aller a l'inscription", path: "/inscription" }],
  },
  {
    id: "login",
    keywords: ["connexion", "connecter", "login", "se connecter", "ouvrir session", "authentification"],
    answer:
      "La connexion se fait dans une seule interface pour les donneurs, les hopitaux et le CNTS. Vous utilisez votre email et votre mot de passe. Une fois connecte, l'application vous redirige automatiquement vers le bon tableau de bord selon votre role.",
    suggestions: [
      "Comment changer mon mot de passe ?",
      "Comment fonctionne le CNTS ?",
      "Google OAuth marche comment ?",
    ],
    actions: [{ label: "Aller a la connexion", path: "/connexion-donneur" }],
  },
  {
    id: "oauth",
    keywords: ["google", "oauth", "connexion google", "continuer avec google"],
    answer:
      "La connexion Google sert a simplifier l'acces pour les utilisateurs qui preferent utiliser leur compte Google. Une fois l'autorisation accordee, l'application cree ou retrouve votre compte puis vous redirige vers votre espace.",
    suggestions: [
      "Comment me connecter sans Google ?",
      "Comment m'inscrire ?",
    ],
    actions: [{ label: "Ouvrir la connexion", path: "/connexion-donneur" }],
  },
  {
    id: "appointment",
    keywords: ["rendez vous", "rdv", "prendre rendez", "prendre un rendez", "appointment", "fixer un rendez"],
    answer:
      "Pour prendre un rendez-vous, le donneur recherche d'abord un centre, puis choisit un hopital ou le CNTS. La demande est envoyee au lieu choisi et reste en attente jusqu'a validation. Une fois confirmee, elle apparait dans le tableau de bord du donneur et dans celui de l'hopital.",
    suggestions: [
      "Comment chercher un centre ?",
      "Que voit l'hopital ?",
      "Comment marche la messagerie ?",
    ],
    actions: [{ label: "Rechercher un centre", path: "/recherche" }],
  },
  {
    id: "search-centers",
    keywords: ["centre", "recherche", "hopital proche", "trouver un centre", "itineraire", "centres"],
    answer:
      "La page de recherche permet de filtrer les centres par ville et groupe sanguin. Vous pouvez ensuite voir les informations du lieu choisi et ouvrir l'itineraire dans Google Maps.",
    suggestions: [
      "Comment prendre un rendez-vous ?",
      "Que voit le donneur apres inscription ?",
    ],
    actions: [{ label: "Ouvrir la recherche", path: "/recherche" }],
  },
  {
    id: "messaging",
    keywords: ["messagerie", "message", "contacter", "discussion", "parler a lhopital", "chat"],
    answer:
      "La messagerie permet au donneur d'ecrire au lieu choisi pour son don. Les hopitaux et le CNTS peuvent aussi contacter les donneurs directement depuis la gestion des donneurs. Les notifications de messages non lus apparaissent dans les tableaux de bord.",
    suggestions: [
      "Comment recevoir les urgences ?",
      "Comment l'hopital valide un rendez-vous ?",
    ],
    actions: [{ label: "Ouvrir la messagerie", path: "/messagerie" }],
  },
  {
    id: "urgencies-campaigns",
    keywords: ["urgence", "campagne", "alerte", "besoin urgent", "stock critique"],
    answer:
      "Les urgences creees par les hopitaux ou le CNTS remontent dans l'interface donneur afin de montrer les besoins actifs en temps reel. Les campagnes nationales sont aussi visibles dans les tableaux de bord pour informer les utilisateurs sur les collectes en cours ou a venir.",
    suggestions: [
      "Comment un hopital signale une urgence ?",
      "Comment un donneur voit les urgences ?",
    ],
  },
  {
    id: "cnts-hospitals",
    keywords: ["cnts", "hopital", "stocks", "reseau hopitaux", "coordination", "administration"],
    answer:
      "Le CNTS joue le role de coordination centrale. Il suit ses propres stocks, les campagnes nationales, les donneurs inscrits et le reseau des autres hopitaux. Les hopitaux gerent leurs rendez-vous, leurs urgences, leurs stocks et leurs donneurs lies a leur activite.",
    suggestions: [
      "Comment un hopital valide un rendez-vous ?",
      "Comment mettre a jour le stock ?",
    ],
    actions: [{ label: "Ouvrir le tableau CNTS", path: "/cnts" }],
  },
  {
    id: "password",
    keywords: ["mot de passe", "password", "changer le mot de passe", "modifier mot de passe"],
    answer:
      "Chaque utilisateur peut changer son mot de passe depuis son tableau de bord. L'option se trouve dans la barre d'actions ou dans le profil selon l'interface.",
    suggestions: [
      "Comment me connecter ?",
      "Comment m'inscrire ?",
    ],
  },
  {
    id: "cni-phone",
    keywords: ["cni", "telephone", "numero", "doublon", "compte unique", "numero unique"],
    answer:
      "Le CNI et le numero de telephone servent a identifier un donneur de maniere plus fiable. L'objectif est d'eviter qu'une meme personne cree plusieurs comptes et de faciliter le suivi des rendez-vous et des echanges avec les centres.",
    suggestions: [
      "Comment m'inscrire ?",
      "Comment l'hopital recherche un donneur ?",
    ],
    actions: [{ label: "Aller a l'inscription", path: "/inscription" }],
  },
  {
    id: "eligibility",
    keywords: ["eligible", "eligibilite", "qui peut donner", "puis je donner", "peut donner son sang", "donner mon sang"],
    answer:
      "En general, une personne peut donner son sang si elle se sent bien, passe le questionnaire pre-don et est jugee apte par l'equipe du centre. Le centre verifie notamment l'etat general, certains antecedents, la tension, l'hemoglobine et d'autres criteres de securite.",
    note: MEDICAL_NOTE,
    suggestions: [
      "Que faire avant un don ?",
      "Quand ne faut-il pas donner ?",
      "A quoi sert le questionnaire pre-don ?",
    ],
  },
  {
    id: "before-donation",
    keywords: ["avant le don", "avant donation", "avant donner", "manger avant", "boire avant", "preparer le don"],
    answer:
      "Avant un don, il est generalement conseille de bien dormir, de boire de l'eau, de manger legerement et de venir en se sentant en forme. Il faut aussi signaler au centre toute maladie recente, traitement ou symptome inhabituel.",
    note: MEDICAL_NOTE,
    suggestions: [
      "Que faire apres le don ?",
      "Quand ne faut-il pas donner ?",
    ],
  },
  {
    id: "after-donation",
    keywords: ["apres le don", "apres donation", "apres donner", "fatigue", "malaise", "vertige apres don"],
    answer:
      "Apres un don, il est prudent de se reposer quelques minutes, boire, manger si besoin et eviter les efforts intenses juste apres. Si vous vous sentez mal, si les symptomes durent ou s'aggravent, il faut prevenir rapidement un professionnel de sante.",
    note: MEDICAL_NOTE,
    suggestions: [
      "Que faire avant un don ?",
      "Quand ne faut-il pas donner ?",
    ],
  },
  {
    id: "temporary-deferral",
    keywords: ["malade", "fievre", "grippe", "antibiotique", "grossesse", "piercing", "tatouage", "transfusion", "infection"],
    answer:
      "Certaines situations peuvent amener le centre a repousser temporairement un don, par exemple une infection en cours, un etat general insuffisant, certains traitements, la grossesse ou des situations a risque recentes. Le centre decide au cas par cas pour proteger le donneur et le receveur.",
    note: MEDICAL_NOTE,
    suggestions: [
      "Qui peut donner son sang ?",
      "Que faire avant un don ?",
    ],
  },
  {
    id: "blood-groups",
    keywords: ["groupe sanguin", "compatibilite", "a+", "a-", "b+", "b-", "ab+", "ab-", "o+", "o-"],
    answer:
      "Le groupe sanguin sert a orienter les besoins des centres et a suivre la disponibilite des poches. L'application affiche les groupes demandes, les stocks critiques et les besoins urgents pour aider les donneurs a comprendre la situation.",
    note:
      "La compatibilite transfusionnelle exacte est verifiee par les equipes medicales et les laboratoires. L'application informe, mais la validation medicale finale se fait toujours au centre.",
    suggestions: [
      "Comment les urgences sont affichees ?",
      "Que voit le CNTS ?",
    ],
  },
  {
    id: "donation-frequency",
    keywords: ["quand redonner", "combien de temps", "90 jours", "prochain don", "delai entre deux dons"],
    answer:
      "Dans cette application, le tableau de bord donneur suit un delai de 90 jours entre deux dons pour afficher la prochaine periode de disponibilite. Le centre de collecte reste toutefois la reference finale selon votre situation reelle.",
    note: MEDICAL_NOTE,
    suggestions: [
      "Que faire avant un don ?",
      "Qui peut donner son sang ?",
    ],
  },
  {
    id: "medical-emergency",
    keywords: ["douleur thoracique", "respire mal", "saigne beaucoup", "perte de connaissance", "urgence medicale", "grave", "je me sens tres mal"],
    answer:
      "Si vous avez un probleme grave ou soudain, ne comptez pas uniquement sur cet assistant. Il faut contacter immediatement un professionnel de sante, un hopital ou le service d'urgence le plus proche.",
    note: MEDICAL_NOTE,
    suggestions: [
      "Que faire apres un don ?",
      "Qui peut donner son sang ?",
    ],
  },
  {
    id: "greeting",
    keywords: ["bonjour", "salut", "bonsoir", "hello", "coucou", "aide"],
    answer:
      "Je peux vous guider sur l'inscription, la connexion, la recherche de centres, les rendez-vous, la messagerie, les urgences, le CNTS et les questions generales sur le don de sang.",
    suggestions: [
      "Comment m'inscrire ?",
      "Comment me connecter ?",
      "Comment prendre un rendez-vous ?",
      "Qui peut donner son sang ?",
    ],
    actions: [
      { label: "Inscription", path: "/inscription" },
      { label: "Connexion", path: "/connexion-donneur" },
    ],
  },
];

const FALLBACK_REPLY: ChatbotReply = {
  answer:
    "Je suis specialise dans DonSang Senegal et les questions generales autour du don de sang. Je peux vous aider sur l'inscription, la connexion, les centres, les rendez-vous, la messagerie, les urgences, le CNTS et les conseils generaux avant ou apres un don.",
  note: MEDICAL_NOTE,
  suggestions: [
    "Comment m'inscrire ?",
    "Comment prendre un rendez-vous ?",
    "Qui peut donner son sang ?",
    "Que faire avant un don ?",
  ],
};

function normalizeText(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9\s+]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function buildChatbotReply(question: string): ChatbotReply {
  const normalizedQuestion = normalizeText(question);

  if (!normalizedQuestion) {
    return FALLBACK_REPLY;
  }

  let bestIntent: ChatbotIntent | null = null;
  let bestScore = 0;

  for (const intent of CHATBOT_INTENTS) {
    let score = 0;

    for (const keyword of intent.keywords) {
      const normalizedKeyword = normalizeText(keyword);

      if (!normalizedKeyword) {
        continue;
      }

      if (normalizedQuestion.includes(normalizedKeyword)) {
        score += normalizedKeyword.includes(" ") ? 4 : 2;
      }

      const keywordTokens = normalizedKeyword.split(" ");
      const matchedTokens = keywordTokens.filter(
        (token) => token.length > 2 && normalizedQuestion.includes(token)
      ).length;
      score += matchedTokens;
    }

    if (score > bestScore) {
      bestIntent = intent;
      bestScore = score;
    }
  }

  if (!bestIntent || bestScore < 2) {
    return FALLBACK_REPLY;
  }

  return {
    answer: bestIntent.answer,
    note: bestIntent.note,
    suggestions: bestIntent.suggestions,
    actions: bestIntent.actions,
  };
}

export function getInitialChatbotReply(): ChatbotReply {
  return {
    answer:
      "Bonjour. Je suis l'assistant DonSang Senegal. Je peux vous expliquer comment utiliser l'application et repondre aux questions generales sur le don de sang.",
    note:
      "Je ne remplace pas un medecin. Pour toute situation urgente ou symptome grave, contactez un professionnel de sante.",
    suggestions: [
      "Comment m'inscrire ?",
      "Comment me connecter ?",
      "Comment prendre un rendez-vous ?",
      "Qui peut donner son sang ?",
    ],
    actions: [
      { label: "Inscription", path: "/inscription" },
      { label: "Connexion", path: "/connexion-donneur" },
      { label: "Trouver un centre", path: "/recherche" },
    ],
  };
}
