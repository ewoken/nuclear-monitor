import React from 'react';

import { Comment, Avatar, Icon } from 'antd';

import './index.css';

function Content() {
  return (
    <div>
      <p>
        {'Ce site est développé par '}
        <a
          href="https://github.com/ewoken"
          target="_blank"
          rel="noopener noreferrer"
        >
          ewoken
        </a>
        .
        <br />
        {'Open-source, vous pouvez consulter le code source ici: '}
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
        {'Vous pouvez aussi me suivre sur Twitter: '}
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
    </div>
  );
}

export default AboutView;
