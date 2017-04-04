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
def process_json_dict_for_moves(dict):
	result = {}
	result["nodes"] = []
	result["links"] = []
	number_of_items = len(dict.items())
	for i in range(number_of_items):

		def extract_moves(json_file, valid_learn_method):
			moves = set()
			for move in json_file["moves"]:
				for item in move["version_group_details"]:
					if item["move_learn_method"]["name"] == valid_learn_method:
						moves.add(move["move"]["name"])
			return moves

		pokemon_info = {}
		pokemon_info["name"] = dict[i+1]["name"]
		pokemon_info["number"] = dict[i+1]["id"]
		pokemon_info["moves"] = list(extract_moves(dict[i+1], "level-up"))

		result["nodes"].append(pokemon_info)
	for i in range(number_of_items):
		for j in range(number_of_items):
			if i != j and i < j:
				move_info = {}
				move_info["source"] = i
				move_info["target"] = j
				move_info["value"] = 0
				move_info["shared_moves"] = []
				for move in result["nodes"][i]["moves"]:
					if move in result["nodes"][j]["moves"]:
						move_info["value"] += 1
						move_info["shared_moves"].append(move)
				if move_info["value"] > 0:
					result["links"].append(move_info)
	return result

def dump_moves_dict_to_json(processed_dict):
	return json.dumps(processed_dict)

json_dict = load_all_json_to_dict(1, 151)
processed = process_json_dict_for_moves(json_dict)
print dump_moves_dict_to_json(processed)
#print json.dumps(processed, sort_keys=True, indent=4, separators=(',', ': '))