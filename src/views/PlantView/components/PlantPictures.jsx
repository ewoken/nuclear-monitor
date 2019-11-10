import React from 'react';

import { Link } from 'react-router-dom';
import { Carousel, Icon } from 'antd';
import { PlantType } from '../../../utils/types';

function PlantPictures(props) {
  const { plant } = props;

  return (
    <div className="PlantPictures">
      <div className="PlantPictures__header">
        <h3>Photos</h3>
        <div>
          <Link to={`/plant/${plant.id}`}>
            <Icon type="caret-up" theme="filled" />
          </Link>
        </div>
      </div>

      <Carousel>
        {plant.pictures.map(picture => (
          <img
            key={picture}
            alt={plant.name}
            src={picture}
            style={{ height: 200 }}
          />
        ))}
      </Carousel>
    </div>
  );
}

PlantPictures.propTypes = {
  plant: PlantType.isRequired,
};

export default PlantPictures;
