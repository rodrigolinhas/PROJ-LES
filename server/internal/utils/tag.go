package utils

import (
	"fmt"
	"strconv"
	"strings"
)

func ParseIDs(raw string) ([]uint, error) {
	parts := strings.Split(raw, ",")
	ids := []uint{}
	seen := map[uint]bool{}

	for _, v := range parts {
		v = strings.TrimSpace(v)
		if v == "" {
			continue
		}

		id64, err := strconv.ParseUint(v, 10, 32)
		if err != nil {
			return nil, fmt.Errorf("invalid ID: %s", v)
		}

		id := uint(id64)
		if seen[id] {
			continue
		}

		seen[id] = true
		ids = append(ids, id)
	}

	if len(ids) == 0 {
		return nil, fmt.Errorf("no valid IDs provided")
	}

	return ids, nil
}
