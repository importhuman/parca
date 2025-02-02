import {useState} from 'react';
import {capitalize} from '@parca/functions';

import Input from '../../../Input';
import {DateTimeRange, RelativeDate, UNITS, UNIT_TYPE} from '../../utils';
import Button from '../../../Button';
import Select, {contructItemsFromArray} from '../../../Select';

const constructKeyAndLabels = (UNITS: UNIT_TYPE[]) => {
  return UNITS.map(unit => ({
    key: unit,
    label: `${capitalize(unit)}s`,
  }));
};

interface RelativeDatePickerProps {
  range: DateTimeRange;
  onChange?: (from: RelativeDate, to: RelativeDate) => void;
}

const quickPresetRanges = [
  {
    title: 'Last 1 hour',
    unit: UNITS.HOUR,
    value: 1,
  },
  {
    title: 'Last 3 hours',
    unit: UNITS.HOUR,
    value: 3,
  },
  {
    title: 'Last 6 hours',
    unit: UNITS.HOUR,
    value: 6,
  },
  {
    title: 'Last 12 hours',
    unit: UNITS.HOUR,
    value: 12,
  },
  {
    title: 'Last 1 day',
    unit: UNITS.DAY,
    value: 1,
  },
  {
    title: 'Last 3 days',
    unit: UNITS.DAY,
    value: 3,
  },
];

const NOW = new RelativeDate(UNITS.MINUTE, 0);

const RelativeDatePicker = ({range, onChange = () => null}: RelativeDatePickerProps) => {
  const date = range.from as RelativeDate;
  const [unit, setUnit] = useState<UNIT_TYPE>(date.isRelative() ? date.unit : UNITS.HOUR);
  const [value, setValue] = useState<number>(date.isRelative() ? date.value : 1);
  return (
    <div className="p-4 w-[300px]">
      <div className="pb-2">
        <div className="mb-4 hidden">
          <span className="uppercase text-xs text-gray-500">Quick Ranges</span>
        </div>
        <div className="grid grid-rows-3 grid-flow-col gap-2">
          {quickPresetRanges.map(({title, unit, value}) => (
            <Button
              onClick={() => {
                onChange(new RelativeDate(unit, value), NOW);
              }}
              color="link"
              key={title}
            >
              {title}
            </Button>
          ))}
        </div>
      </div>
      <div>
        <div className="my-4 border-b-[1px] border-gray-200 text-xs leading-[0px] mx-auto text-center">
          <span className="bg-gray-100 dark:bg-gray-800 px-1">OR</span>
        </div>
        <div className="flex items-center justify-center p-1 my-4">
          <span className="uppercase text-xs mr-4">Last</span>
          <Input
            type="number"
            className="w-16 mr-2 text-sm"
            value={value}
            min={0}
            onChange={e => setValue(parseInt(e.target.value, 10))}
          />
          <Select
            className="w-32"
            items={contructItemsFromArray(constructKeyAndLabels(Object.values(UNITS)))}
            selectedKey={unit}
            onSelection={key => setUnit(key as UNIT_TYPE)}
          />
        </div>
        <div className="w-32 mx-auto pb-2">
          <Button
            onClick={() => {
              onChange(new RelativeDate(unit, value), NOW);
            }}
          >
            Apply
          </Button>
        </div>
      </div>
      <p className="text-gray-500 text-xs italic text-center mx-4">
        Note: Setting a relative time means that on every search the time will be set to the time of
        the search.
      </p>
    </div>
  );
};

export default RelativeDatePicker;
