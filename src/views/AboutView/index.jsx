import React from 'react';

import { Comment, Avatar, Icon, Collapse } from 'antd';

import './index.css';

function Content() {
  return (
    <div>
      <p>
        {'Ce site est open-source, vous pouvez consulter son code source ici: '}
        <br />
        <a
          href="https://github.com/ewoken/nuclear-monitor"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Icon type="github" />
          {' nuclear-monitor'}
        </a>
      </p>

      <p>
        {
          "N'hésitez pas à me remontez des bugs ou suggestions sur Github ou Twitter:"
        }
        <br />
        <a
          href="https://twitter.com/Yugnat95"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Icon type="twitter" />
          {' @Yugnat95'}
        </a>
      </p>

      <p>
        {"D'autres sites pour suivre les données électriques:"}
        <ul>
          <li>
            <a
              href="https://www.rte-france.com/fr/eco2mix/eco2mix-mix-energetique"
              target="blanck"
            >
              éco2mix
            </a>
          </li>
          <li>
            <a href="https://www.electricitymap.org" target="blanck">
              electricity-map
            </a>
          </li>
          <li>
            <a href="http://www.facteurs-charge.fr/" target="blanck">
              facteurs-charge.fr
            </a>
          </li>
        </ul>
      </p>
    </div>
  );
}

function AboutView() {
  return (
    <div className="AboutView">
      <h2>À propos</h2>
      <div>
        <Comment
          avatar={
            // eslint-disable-next-line react/jsx-wrap-multilines
            <a
              href="https://github.com/ewoken"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Avatar src="https://avatars3.githubusercontent.com/u/8919530?s=460&v=4" />
            </a>
          }
          // author={<a href="https://github.com/ewoken">Ewoken</a>}
          content={<Content />}
        />
      </div>
      <h2>Foire aux questions</h2>
      <Collapse accordion bordered={false}>
        <Collapse.Panel
          header="Comment fonctionne un réacteur nucléaire ?"
          key="1"
        >
          Explication en moins de 3 min:
          <iframe
            title="Youtube"
            width="100%"
            src="https://www.youtube.com/embed/I09DhTubNqE"
            frameBorder="0"
            allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
          {`Si vous voulez plus de détails, nous vous recommendons d'aller regarder les épisodes dédiés de `}
          <a href="https://www.youtube.com/channel/UC1EacOJoqsKaYxaDomTCTEQ">
            {'Le Réveilleur '}
            <Icon type="youtube" />
          </a>
          {' sur Youtube'}
        </Collapse.Panel>
        <Collapse.Panel
          header="Pourquoi un réacteur est-il à l’arrêt ?"
          key="2"
        >
          {"Un réacteur peut être à l'arrêt pour différentes raisons:"}
          <ul>
            <li>
              le rechargement d&apos;une partie du combustible, nécessaire tous
              les 12 à 18 mois;
            </li>
            <li>
              {`une maintenance a été prévue et nécessite l'arrêt du réacteur lors d'une période de faible consommation;`}
            </li>
            <li>un incident ou une défaillance est survenue.</li>
          </ul>
        </Collapse.Panel>
        <Collapse.Panel
          header="Pourquoi certains réacteurs ne tournent pas à puissance maximale ?"
          key="3"
        >
          {
            'Un réacteur peut fonctionner à puissance réduite pour différentes raisons:'
          }
          <ul>
            <li>
              la consommation ne nécessite pas toute la puissance du réacteur
            </li>
            <li>
              une maintenance ne nécessitant pas l&apos;arrêt du réacteur est en
              cours.
            </li>
          </ul>
        </Collapse.Panel>
        <Collapse.Panel header="Pourquoi cette application ?" key="4">
          Cette application a pour but de matérialiser et rendre accessible les
          informations disponibles sur l&apos;ensemble du parc électro-nucléaire
          français.
        </Collapse.Panel>
        <Collapse.Panel header="Quelles sont les sources de données ?" key="5">
          {
            "Les données de disponibilités, de production et de consommation sont disponibles gratuitement via l'API de "
          }
          <a href="https://data.rte-france.com/">RTE</a>
        </Collapse.Panel>
        <Collapse.Panel
          header="Comment est calculé le facteur d’émission de GES de la production électrique "
          key="6"
        >
          {
            "Le facteur d'émission de la production électrique est calculé à partir du facteur d'émissions en cycle de vie de chaque type de production. La source principalement utilisée est l'"
          }
          <a href="http://www.bilans-ges.ademe.fr/">ADEME</a>
          {' mais aussi le '}
          <a href="https://www.ipcc.ch/site/assets/uploads/2018/02/ipcc_wg3_ar5_annex-iii.pdf">
            GIEC (p. 1335)
          </a>
          {" pour le facteur d'émission des bioénergies."}
          <br />
          {
            'Enfin, les imports sont moyennés à 400 gCO₂eq/kWh (moyenne européenne)'
          }
        </Collapse.Panel>
        <Collapse.Panel
          header="Pourquoi certaines centrales ont des aéroréfrigérants et d’autres pas ?"
          key="7"
        >
          Certaines centrales, comme celles en bord de mer (mais pas que), sont
          refroidis en cycle ouvert, l&apos;eau utilisée est rejetée directement
          dans l&apos;environnement.
          <br />
          D&apos;autres fonctionnent en cycle fermé, c&apos;est à dire que
          l&apos;eau utilisée est refroidie dans les aéroréfrigérants (et une
          partie s&apos;évapore) puis est réutilisée. Cela permet de réduire
          l&apos;eau prélevée dans l&apos;environnement (les fleuves).
        </Collapse.Panel>
        <Collapse.Panel
          header="Comment la puissance d’un réacteur peut-elle être supérieure à sa puissance nominale ?"
          key="8"
        >
          Un réacteur a pleine puissance peut parfois produire plus
          d&apos;électricité que sa puissance nominale. En effet, lorsque la
          source de refroidissement de la centrale est plus froide que prévue,
          le rendement thermodynamique est amélioré faisant gagner un peu de
          puissance.
          <br />
          Une autre possibilité est que la consommation interne de la centrale
          est réduite, ce qui augmente l&apos;électricité distribuée en sortie
          de la centrale.
        </Collapse.Panel>
      </Collapse>
    </div>
  );
}

export default AboutView;
