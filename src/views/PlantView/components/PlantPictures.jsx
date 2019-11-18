import React from 'react';

import { Carousel, Icon } from 'antd';
import { PlantType } from '../../../utils/types';
import Link from '../../../components/Link';

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
          <img key={picture} alt={plant.name} src={picture} />
        ))}
      </Carousel>
    </div>
  );
}

PlantPictures.propTypes = {
  plant: PlantType.isRequired,
};

export default PlantPictures;
