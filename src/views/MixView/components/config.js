export const META = {
  hydroPumped: {
    label: 'POMPAGE',
    color: '#114774',
    stackId: '2',
  },
  biomass: {
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
  'biomass',
  'wind',
  'solar',
  'nuclear',
  'hydro',
  'gas',
  'coal',
  'oil',
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
  'biomass',
  'hydroPumped',
];
