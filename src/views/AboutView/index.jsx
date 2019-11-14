import React from 'react';

import { Comment, Avatar, Icon } from 'antd';

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
