## Using Screeps Prometheus

1) Copy 'config.template.js' to 'config.js'.
2) Modify the values to work with your account.

See [screeps-prometheus-game](https://github.com/BrainWart/screeps-prometheus-game) for examples creating the memory layout

## Sample Memory
```json
{
  "cpu": {
    "used": 2.095324299999902,
    "bucket": 10000
  },
  "roomSummary": {
    "E42N35": {
      "promStat": "label",
      "label": "roomName",
      "value": {
        "controller_level": 4,
        "controller_progress": 246701,
        "controller_progress_needed": 405000,
        "controller_downgrade": 40000,
        "energy_avail": 1300,
        "energy_cap": 1300,
        "source_energy": 4068,
        "mineral_type": {
          "promStat": "label",
          "label": "U",
          "value": {
            "mineral_amount": 70000
          }
        },
        "storage_energy": 106548
      }
    }
  },
  "gcl": {
    "level": 3,
    "progress": 7608813.356908423,
    "progress_total": 8688578.522146657
  },
  "market": {
    "credits": 0,
    "num_orders": 0
  },
  "memory": {
    "used": 21901
  }
}
```
