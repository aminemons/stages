# Recherche matériaux expérimentaux — 29 octobre 2026

## Contrat de qualité et résultat
Revue de pages de postes exactes d'employeurs, de laboratoires et d'annonces institutionnelles (pas de comptage de résultats d'agrégateurs). **3 nouveaux IDs distincts** intégrés à `index.html`, `data/internships.csv` et au flux Google Sheets ; 3 fiches existantes recontrôlées. Aucune candidature envoyée.

- Catalogue HTML et CSV : **474 IDs uniques** (471 avant cette revue).
- Matériaux présélectionnés, non retirés : **31**.
- Fiches matériaux historiquement relues individuellement : **26 / 400** (374 restantes).
- Fiches matériaux avec descriptif exact visible selon le dernier statut : **19**.
- Profils Bac+4/M1 étayés parmi les fiches présélectionnées : **18**.
- Rémunérations numériques publiées : **7**. Les indemnités sans montant ne sont pas transformées en salaire.
- IDs d'origine `stage-N` préservés : **409**. L'écart historique avec l'attente de 416 demeure non résolu, sans recréation artificielle.
- Le compteur 400 est un **objectif cumulatif**, pas un total de stages ouverts simultanément.

## Nouvelles annonces lues et importées

| ID | Source exacte | Niveau M1 | Dates / durée | Rémunération | Preuve et limites |
|---|---|---|---|---|---|
| `imn-zn-mno2-2027` | https://www.cnrs-imn.fr/offres-demploi-these-stage/ | **M1/M2 et cycle Bac+4/5 explicites** | Début 2027 non précisé ; durée non publiée dans la page | Non publiée | Page officielle IMN, rubrique stage « Nouvelles batteries Zn-ion aqueuses », étude Zn/MnO₂; contact de stage **Dylan Neau, dylan.neau@cnrs-imn.fr** explicitement publié. Le PDF de détail `ST2E_Stage_2026_09_17.pdf` renvoie **502** dans l'outil : pas de prétention de lecture PDF. |
| `mbda-r38312` | https://www.mbda-systems.com/country-fr/careers/stage-materiaux-caracterisation-de-laptitude-au-soudage-de-differents-assemblages-fh-r38312 | **Incertain** : 2e/3e année cycle ingénieur ou équivalent, sans mention M1 universitaire | Février 2027 modulable, 6 mois | « supérieure au minimum légal », **montant non publié** | Fiche officielle MBDA R38312, caractérisation d'assemblages soudés et défauts, essais mécaniques. Bouton « Postuler » visible; pas de restriction de nationalité/habilitation publiée dans cette fiche, ne pas en inférer. |
| `is2m-polythioesters-m1-2027` | https://fr.linkedin.com/posts/institut-science-materiaux-mulhouse_stage-m1-activity-7516761479971520512-VALr | **M1 explicitement annoncé** | 1er semestre 2027, 3–4 mois | Non publiée | Publication du **compte institutionnel IS2M** : synthèse et caractérisation de dispersions aqueuses de polythioesters recyclables; encadrants Abraham Chemtob et Noémie Adelbrecht. Page institutionnelle https://www.is2m.uha.fr/fr/nos-axes-thematiques/i2m-membres/ corrobore leur affiliation, mais aucune fiche de candidature ou PDF exact n'a été trouvé : disponibilité **incertaine**, pas d'e-mail inventé. |

## Trois fiches existantes recontrôlées

- `cea-2026-41966` — https://www.emploi.cea.fr/offre-de-emploi/emploi-stage-bac-4-materiaux-et-energie-h-f_41966.aspx : Bac+4/M1 explicite, 5 mois à partir du 01/03/2027; dépôt PVD de couches TCO à base d'étain, propriétés optiques et électriques. Statut `listing_visible`, salaire inconnu. **Pas de nouvel ID**.
- `sg-fra40497` — https://joinus.saint-gobain.com/fr/fra/red/i/44507/326933/stage-conception-de-formulations-de-liants-biosources-hf : M1/M2 explicite, formulation de liants biosourcés, **1 000–1 500 €/mois** sur page officielle. **Incohérence de date** dans le descriptif : « février 2027 ou mars 2026 » ; demander confirmation, ne pas corriger par supposition. **Pas de nouvel ID**.
- `michelin-hydrogels-2027` — https://recrutement.michelin.fr/job-offer-result-list/stage-r-d-synth%C3%A8se-de-polyester-et-obtention-d-hydrogels-biocompatibles-h-slash-f-clermont-fd : la recherche retrouve le descriptif officiel indexé le 23/10/2026 (Bac+4/+5, hydrogels), mais **l'ouverture directe du 29/10 redirige vers la recherche générale**. Statut passé de `listing_visible` à `uncertain` ; aucune fermeture inventée.

## Recherches, exclusions et pistes non importées

- IFPEN `347165` https://stages.ifpenergiesnouvelles.fr/annonce/detail/347165 : nanoparticules catalytiques Rh/Ni, mais **troisième année ingénieur ou Master 2** exclusivement dans le profil. Exclu de la liste M1.
- Saint-Gobain `FRA40578` https://joinus.saint-gobain.com/fr/fra/red/i/53570/327149/stage-ingenieur-rd-developpement-de-nouvelles-poudres-base-de-zircone-hf : très bon sujet expérimental, 1 200–1 500 €/mois, mais **dernière année d'école d'ingénieur** exigée; exclu du nouveau décompte M1.
- Saint-Gobain `FRA40347` https://joinus.saint-gobain.com/fr/fra/red/i/71706/325117/stage-ingenieure-rd-materiauxchimie-encres-ceramiqueshf : chimie d'encres céramiques et caractérisation, 1 200–1 500 €/mois, mais **dernière année ingénieur/Master**, M1 non étayé; non importé.
- Saint-Gobain `FRA40305` : procédés d'impression verriers, profil **Bac+5** et traitement d'images; non importé.
- Arkema Sartomer : https://jobs.arkema.com/job/Verneuil-en-Halatte-Stagiaire-R%26D-D%C3%A9veloppement-de-r%C3%A9sines-acryliques-et-m%C3%A9thacryliques-photor%C3%A9ticulables-Haut/1444824633/ ; **Master 2 ou école d'ingénieur**, M1 non confirmé; non importé.
- CNRS/IMN : page officielle offre aussi des sujets M2 seuls (verres XPS, HiPIMS) : ne pas les mélanger avec l'annonce Zn/MnO₂ Bac+4.
- Laboratoire PHENIX (Paris) et CEA IRAMIS : offres 2027 identifiées mais **M2 requis**, exclues de la shortlist M1.
- MBDA `R38387` est déjà présent dans plusieurs IDs historiques et `mbda-r38387`; **aucun nouvel ID** ajouté pour la même offre. MBDA `R38166` cible BTS/BUT, non prioritaire M1. MBDA `R38585` demande programmation Python/Matlab et n'est pas une mission matériaux expérimentale, exclu.
- Autres recherches France entière (Lyon, Clermont-Ferrand, Rantigny, Thourotte, Nantes, Mulhouse, Paris/Saclay, Cavaillon, Strasbourg, Lille, Toulouse, Bordeaux) : nombreuses fiches hors profil, anciennes ou M2 seulement. Le taux de nouveaux rôles M1 réellement documentés est faible; **ne pas gonfler les chiffres**.

## Intégrité et publication
- Les identifiants `stage-N` n'ont pas été renumérotés; le filtre « Ajout au site » s'appuie sur `added_on=2026-10-29` pour les trois nouvelles fiches.
- Google Sheets : ajout de 3 IDs dans **Flux automatique GitHub**, mise à jour des 3 fiches recontrôlées; **Suivi des candidatures** laissé intact.
- Le texte « Dernière recherche » a été porté au 29/10/2026 après revue réelle. « Contrôle des liens » reste au 26/10/2026, sans inventer un audit quotidien.
- L'état final de la production Vercel doit être vérifié séparément sur le SHA exact du dernier commit.
