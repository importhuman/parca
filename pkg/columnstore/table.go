package columnstore

import (
	"github.com/google/btree"
)

type Table struct {
	schema Schema

	index *btree.BTree
}

func NewTable(schema Schema) *Table {
	return &Table{
		schema: schema,
		index:  btree.New(2), // TODO make the degree a setting
	}
}

func (t *Table) Insert(rows []Row) error {
	// Special case: if there are no granules, create the very first one and immediately insert the first part.
	if t.index.Len() == 0 {
		p, err := NewPart(t.schema, rows)
		if err != nil {
			return err
		}

		g := NewGranule(p)
		t.index.ReplaceOrInsert(g)
		return nil
	}

	rowsToInsertPerGranule := t.splitRowsByGranule(rows)
	for granule, rows := range rowsToInsertPerGranule {
		p, err := NewPart(t.schema, rows)
		if err != nil {
			return err
		}

		granule.AddPart(p)
		if granule.Cardinality() >= t.schema.GranuleSize {
			// TODO: splits should be performed in the background. Do it now for simplicity
			granules := granule.Split(t.schema.GranuleSize / 2) // TODO magic numbers
			t.index.Delete(granule)
			for _, g := range granules {
				t.index.ReplaceOrInsert(g)
			}
		}
	}

	return nil
}

// Iterator iterates in order over all granules in the table. It stops iterating when the iterator function returns false.
func (t *Table) Iterator(iterator btree.ItemIterator) {
	t.index.Ascend(iterator)
}

func (t *Table) splitRowsByGranule(rows []Row) map[*Granule][]Row {
	rowsByGranule := map[*Granule][]Row{}

	// Special case: if there is only one granule, insert parts into it until full.
	if t.index.Len() == 1 {
		rowsByGranule[t.index.Min().(*Granule)] = rows
		return rowsByGranule
	}

	// TODO: general case: split rows into groups of rows belonging to the respective granule.

	return rowsByGranule
}
