import { map } from 'ramda';

const { REACT_APP_NUCLEAR_MONITOR_API } = process.env;

async function doFetch(...args) {
  const res = await fetch(...args);

  if (!res.ok) {
    throw new Error('Fetch error');
  }
  return res;
}

export async function getRivers() {
  return Promise.all(
    ['garonne', 'loire', 'meuse', 'moselle', 'rhin', 'rhone', 'seine'].map(
      river =>
        fetch(`./rivers/${river}.json`)
          .then(res => res.json())
          .then(res => ({ ...res, name: river })),
    ),
  );
}

export async function getPlants() {
  const res = await doFetch(`${REACT_APP_NUCLEAR_MONITOR_API}/plants`);
  const data = await res.json();

  return data;
}

export async function getReactors() {
  const res = await doFetch(`${REACT_APP_NUCLEAR_MONITOR_API}/reactors`);
  const data = await res.json();

  return data;
}

export async function getProductions() {
  const res = await doFetch(`${REACT_APP_NUCLEAR_MONITOR_API}/productions`);
  const data = await res.json();

  return data.productions;
}

export async function getUnavailabilities() {
  const res = await doFetch(
    `${REACT_APP_NUCLEAR_MONITOR_API}/unavailabilities`,
  );
  const data = await res.json();

  return data;
}

export async function getMix() {
  const res = await doFetch(`${REACT_APP_NUCLEAR_MONITOR_API}/mix`);
  const data = await res.json();

  const { mix } = data;
  if (mix.length < 1) {
    return [];
  }

  const rest = Array.from({ length: 24 * 4 - mix.length }).map(() =>
    map(() => NaN, mix[0]),
  );

  return mix.concat(rest);
}
