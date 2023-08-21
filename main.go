package main

import (
	"encoding/json"
	"log"
	"os"
	"path/filepath"
	"strings"

	"github.com/sethvargo/go-githubactions"
)

type ManifestInfo struct {
	Full string `json:"full"`
	Change string `json:"change"`
	Short string `json:"short"`
}

var manifests []ManifestInfo

// Finds manifest files and adds them to manifests slice.
func find(manifest string) {
	err := filepath.Walk(".",
		func(path string, info os.FileInfo, err error) error {

		if err != nil {
			return err
		}

		// Splits strings by /.
		split := strings.Split(path, "/")

		// If last index of string is equal to manifest file.
		if split[len(split)-1] == manifest {
			// Create struct with manifest info.
			m := ManifestInfo {
				Short: strings.TrimRight(strings.Split(path, manifest)[0], "/"),
				Change: strings.Split(path, manifest)[0],
				Full: path,
			}

			manifests = append(manifests, m)
		}
		return nil
	})

	if err != nil {
		log.Println(err)
	}
}

func main() {
	// find("package.json")
	input_manifests := githubactions.GetInput("manifests")

	if input_manifests == "" {
		githubactions.Fatalf("Missing input: 'manifests'")
	}

	find(input_manifests)

	j, _ := json.Marshal(manifests)
	// fmt.Println(string(j))
	githubactions.SetOutput("matrix", string(j))
}