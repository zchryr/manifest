package main

import (
	"encoding/json"
	"fmt"
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
	// List all env vars.
	// fmt.Println(os.Environ())

	// find("package.json")
	input_manifest := githubactions.GetInput("manifest")
	fmt.Println("input_manifest:" + input_manifest)

	if input_manifest == "" {
		githubactions.Fatalf("Missing input: 'manifest'")
	}

	find(input_manifest)

	j, _ := json.Marshal(manifests)
	fmt.Println(string(j))
	githubactions.SetOutput("matrix", string(j))
}