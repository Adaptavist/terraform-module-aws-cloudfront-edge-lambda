package test

import (
	"io/ioutil"
	
	"net/http"
	"net/url"
	"strings"
	"testing"

	"github.com/gruntwork-io/terratest/modules/terraform"
	"github.com/stretchr/testify/assert"
)

// TestHeaderModule - Our test entry point
func TestHeaderModule(t *testing.T) {

	postfix := RandomString(8)

	// Terraforming	
	terraformOptions := generateTerraformOptions(assumeRoleArn, postfix, "hsts-header")	
	defer destroyInfra(&terraformOptions, t)
	terraform.InitAndApply(t, &terraformOptions)
	outputs := terraform.OutputAll(t, &terraformOptions)

	assertModuleOutputs(t, outputs)
	publicDomainName := outputs["public_domain_name"].(string)

	defaultHeaders := map[string][]string{
		"Content-Type": {"application/json; charset=UTF-8"},
	}

	desiredResponseHeaders := map[string][]string{
		"Strict-Transport-Security": {"max-age=31536000"},
	}

	// Hit CF distro and make sure we get correct response
	testBodyAndHeader("\"baseUrl\":\"https://sr-cloud-test.connect.adaptavist.com\"", "https://"+publicDomainName+"/sr-dispatcher/jira/atlassian-connect.json", defaultHeaders, desiredResponseHeaders, t)	
}

func testBodyAndHeader(testValue string, testURL string, requestHeaders map[string][]string, desiredResponseHeaders map[string][]string, t *testing.T) {

	requestURL, _ := url.Parse(testURL)

	req := &http.Request{
		Method: "GET",
		URL:    requestURL,
		Header: requestHeaders,
	}

	resp, err := http.DefaultClient.Do(req)

	assert.Nil(t, err, "There should not have been an error getting the url "+testURL)
	assert.Equal(t, resp.Status, "200 OK", "There should have been a HTTP 200 getting the url "+testURL)

	bodyBytes, err := ioutil.ReadAll(resp.Body)

	assert.Nil(t, err, "There should not of been an error reading response body")

	bodyString := string(bodyBytes)
	assert.True(t, strings.Contains(bodyString, testValue), testURL+" should contain the value "+testValue)

	for key, element := range desiredResponseHeaders {
		responseHeaders :=  resp.Header		
		assert.NotNil(t, responseHeaders[key], "Response should include the header")
		assert.Equal(t, responseHeaders[key], element, "Response header value not correct")
    }
}

