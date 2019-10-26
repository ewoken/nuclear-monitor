import moment from 'moment-timezone';
import qs from 'qs';

const { REACT_APP_NUCLEAR_MONITOR_API } = process.env;

export async function getPlants() {
  await new Promise(resolve => setTimeout(resolve, 2000));

  const res = await fetch(`${REACT_APP_NUCLEAR_MONITOR_API}/plants`);
  const data = await res.json();

  return data;
}

export async function getReactors() {
  const res = await fetch(`${REACT_APP_NUCLEAR_MONITOR_API}/reactors`);
  const data = await res.json();

  return data;
}

export async function getProductions() {
  const res = await fetch(`${REACT_APP_NUCLEAR_MONITOR_API}/productions`);
  const data = await res.json();

  return data;
}

export async function getUnavailabilities() {
  const res = await fetch(`${REACT_APP_NUCLEAR_MONITOR_API}/unavailabilities`);
  const data = await res.json();

  return data;
}

const START_URL =
  'https://opendata.reseaux-energies.fr/api/records/1.0/search/?';
const DATE_FORMAT = 'YYYY-MM-DD';
export async function getMix() {
  const res = await fetch(
    `${START_URL}${qs.stringify({
      dataset: 'eco2mix-national-tr',
      rows: 96,
      sort: '-date_heure',
      'refine.date': moment()
        .tz('Europe/Paris')
        .format(DATE_FORMAT),
    })}`,
  );
  const data = await res.json();

  const mix = data.records.map(({ fields }) => ({
    isOk: !!fields.nucleaire,
    datetime: moment(fields.date_heure).unix(),
    wind: Number(fields.eolien),
    solar: Number(fields.solaire),
    nuclear: Number(fields.nucleaire),
    gas: Number(fields.gaz),
    oil: Number(fields.fioul),
    coal: Number(fields.charbon),
    consumption: Number(fields.consommation),
    biomass: Number(fields.bioenergies),
    hydroPumped: Number(fields.pompage),
    hydro: Number(fields.hydraulique),
    imports: Math.max(0, Number(fields.ech_physiques)),
    exports: Math.min(0, Number(fields.ech_physiques)),
  }));

  return mix;
}
