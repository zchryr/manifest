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

func find(manifest string) {
	err := filepath.Walk(".",
		func(path string, info os.FileInfo, err error) error {

		if err != nil {
			return err
		}

		split := strings.Split(path, "/")
		if split[len(split)-1] == manifest {
			m := ManifestInfo {
				Short: strings.TrimRight(strings.Split(path, manifest)[0], "/"),
				Change: "./" + strings.Split(path, manifest)[0],
				Full: "./" + path,
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
	find("package.json")

	j, _ := json.Marshal(manifests)
	fmt.Println(string(j))

	githubactions.SetOutput("matrix", string(j))
}