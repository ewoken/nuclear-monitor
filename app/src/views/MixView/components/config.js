export const META = {
  hydroPumped: {
    label: 'POMPAGE',
    color: '#114774',
    stackId: '2',
  },
  bioenergy: {
    label: 'BIOENERG.',
    color: '#166a57',
  },
  wind: {
    label: 'EOLIEN',
    color: '#74cdb9',
  },
  solar: {
    label: 'SOLAIRE',
    color: '#f27406',
  },
  nuclear: {
    label: 'NUCLEAIRE',
    color: '#f5b300',
  },
  hydro: {
    label: 'HYDRAU.',
    color: '#2772b2',
  },
  gas: {
    label: 'GAS',
    color: '#f30a0a',
  },
  coal: {
    label: 'CHARBON',
    color: '#ac8c35',
  },
  oil: {
    label: 'FIOUL',
    color: '#8356a2',
  },
  exports: {
    label: 'EXPORTS',
    color: '#969696',
    stackId: '2',
  },
  imports: {
    label: 'IMPORTS',
    color: '#969696',
  },
};

export const GRAPH_ORDER = [
  'hydroPumped',
  'exports',
  'bioenergy',
  'nuclear',
  'hydro',
  'gas',
  'coal',
  'oil',
  'wind',
  'solar',
  'imports',
];

export const HEADER_ORDER = [
  'oil',
  'coal',
  'gas',
  'hydro',
  'nuclear',
  'solar',
  'wind',
  'bioenergy',
  'hydroPumped',
];

export const EMISSION_FACTORS = {
  bioenergy: 230,
  nuclear: 6,
  hydro: 6,
  gas: 418,
  coal: 1060,
  oil: 730,
  wind: 14.1,
  solar: 55,
  imports: 400,
};
