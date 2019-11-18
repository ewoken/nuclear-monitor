import { map } from 'ramda';
import qs from 'qs';

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

export async function getProductions({ date }) {
  const res = await doFetch(
    `${REACT_APP_NUCLEAR_MONITOR_API}/productions?${qs.stringify({ date })}`,
  );
  const data = await res.json();

  return data;
}

export async function getUnavailabilities({ date }) {
  const res = await doFetch(
    `${REACT_APP_NUCLEAR_MONITOR_API}/unavailabilities?${qs.stringify({
      date,
    })}`,
  );
  const data = await res.json();

  return data;
}

export async function getMix({ date }) {
  const res = await doFetch(
    `${REACT_APP_NUCLEAR_MONITOR_API}/mix?${qs.stringify({ date })}`,
  );
  const data = await res.json();

  const { mix } = data;
  if (mix.length < 1) {
    return [];
  }

  const rest = Array.from({ length: 24 * 4 - mix.length }).map(() =>
    map(() => NaN, mix[0]),
  );

  return {
    date: data.date,
    mix: mix.concat(rest),
  };
}
