package main

import (
	"encoding/json"
	"fmt"
	"log"
	"os"
	"path/filepath"
	"regexp"
	"strings"

	"github.com/sethvargo/go-githubactions"
	"golang.org/x/exp/slices"
)

type ManifestInfo struct {
	Full string `json:"full"`
	Change string `json:"change"`
	Short string `json:"short"`
}

// Slice to contain information about manifest found during search.
var manifests []ManifestInfo

// Slice to contain information from input on which directories to ignore.
var ignore []string

// Default search path.
var path string = "."

// Finds manifest files and adds them to manifests slice.
func find(manifest string) {
	err := filepath.Walk(path,
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

			// If the manifest found is not the ignore string.
			if !slices.Contains(ignore, m.Short) && !slices.Contains(ignore, split[0]) {
				manifests = append(manifests, m)
			}
		}
		return nil
	})

	if err != nil {
		log.Println(err)
	}
}

// Completes a regex check to make sure input is comma separated string.
// If valid, sets value of ignore slice to the value of the input.
// This regex supports forward slashes, underscores, and dashes.
func regexMatchCommaSeparatedString(comma_separated_string string) bool {
	matched, _ := regexp.MatchString(`^([a-z0-9\s\/-_]+,)*([a-z0-9\/\s\-_]+){1}$`, comma_separated_string)

	if matched {
		split := strings.Split(comma_separated_string, ",")
		ignore = split

		return true
	} else  {
		return false
	}
}

func main() {
	// GitHub Actions has this environment variable = true.
	ci := os.Getenv("CI")

	// Get inputs.
	input_manifest := os.Getenv("INPUT_MANIFEST")
	input_ignore := os.Getenv("INPUT_IGNORE")
	input_path := os.Getenv("INPUT_PATH")
	path = input_path

	// If running in GitHub Actions.
	if ci == "true" {
		// If 'manifest' input is not set.
		if input_manifest == "" {
			githubactions.Fatalf("Missing input: 'manifest'")
		}

		// If 'ignore' input is set, test for valid value.
		if input_ignore != "" {
			if !regexMatchCommaSeparatedString(input_ignore) {
				githubactions.Fatalf("Input: 'ignore' failed comma separated string check.")
			}
		}

		find(input_manifest)

		// Convert slice to JSON.
		j, _ := json.Marshal(manifests)
		fmt.Println(string(j))
		githubactions.SetOutput("matrix", string(j))
	} else { // If running locally.
		// If 'manifest' input is not set.
		if input_manifest == "" {
			fmt.Println("Missing environment variable: 'INPUT_MANIFEST'")
			os.Exit(1)
		}

		// If 'ignore' input is set, test for valid value.
		if input_ignore != "" {
			if !regexMatchCommaSeparatedString(input_ignore) {
				fmt.Println("Input: 'ignore' failed comma separated string check.")
				os.Exit(1)
			}
		}

		find(input_manifest)

		// Convert slice to JSON.
		j, _ := json.Marshal(manifests)
		fmt.Println(string(j))
	}
}