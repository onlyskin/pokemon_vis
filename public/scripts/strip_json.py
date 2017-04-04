import json

#returns a dictionary with #number indexes to json of the pokemon
def load_all_json_to_dict(x, y):
	result = {}
	for i in range(x, y+1):
		f = open('pokeapi_cache/' + str(i) + '.json', 'r')
		json_of_f = json.load(f)
		result[i] = json_of_f
	return result

#returns a python json structure for use with json.dump for the moves.json visualisation
def strip_dict(dict):
	result = {"json": []}
	number_of_items = len(dict.items())
	for i in range(number_of_items):
		output = {}
		output["name"] = dict[i+1]["name"]
		output["id"] = dict[i+1]["id"]
		output["weight"] = dict[i+1]["weight"]
		output["height"] = dict[i+1]["height"]
		output["base_experience"] = dict[i+1]["base_experience"]
		result["json"].append(output)
#		output["location_area_encounters"] = dict[i+1]["location_area_encounters"]

		output["types"] = {}
		for item in dict[i+1]["types"]:
			output["types"][item["slot"]] = item["type"]["name"]

		output["stats"] = {}
		for item in dict[i+1]["stats"]:
			output["stats"][item["stat"]["name"]] = item["base_stat"]

		output["abilities"] = []
		for item in dict[i+1]["abilities"]:
			output["abilities"].append(item["ability"]["name"])

		def extract_moves(json_file, valid_learn_method):
			moves = set()
			for move in json_file["moves"]:
				for item in move["version_group_details"]:
					if item["move_learn_method"]["name"] == valid_learn_method:
						moves.add(move["move"]["name"])
			return moves

		output["moves"] = list(extract_moves(dict[i+1], "level-up"))

	return result

def dump_moves_dict_to_json(processed_dict):
	return json.dumps(processed_dict)

json_dict = load_all_json_to_dict(1, 251)
processed = strip_dict(json_dict)
print dump_moves_dict_to_json(processed)
#print json.dumps(processed, sort_keys=True, indent=4, separators=(',', ': '))