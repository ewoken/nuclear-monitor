import React from 'react';

import { Typography } from 'antd';
import Link from '../../components/Link';

const { Title } = Typography;

function HomeView() {
  return (
    <div className="HomeView">
      <Title level={2}>Bienvenue</Title>
      <div>
        <strong>Nuclear monitor</strong>
        {' vous permet de consulter:'}
        <ul>
          <li>
            {'le '}
            <Link to="/mix">mix</Link>
            {" de production d'électricité"}
          </li>
          <li>
            {"l'état d'une "}
            <Link to="/plant/GRAVELINES">centrale</Link>
            {" ou d'un "}
            <Link to="/plant/BLAYAIS/3">réacteur</Link>
          </li>
        </ul>
      </div>
      <div className="HomeView__marker">
        Cliquer sur une centrale pour en savoir plus...
      </div>
    </div>
  );
}

export default HomeView;
