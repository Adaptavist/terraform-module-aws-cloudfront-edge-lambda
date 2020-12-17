package test

import (
	"io/ioutil"
	"math/rand"
	"net/http"
	"net/url"
	"os"
	"strings"
	"testing"
	"time"

	"github.com/gruntwork-io/terratest/modules/terraform"
	"github.com/stretchr/testify/assert"
)

var seededRand = rand.New(rand.NewSource(time.Now().UnixNano()))
var assumeRoleArn = os.Getenv("SANDBOX_ORG_ROLE_ARN")

const region = "us-east-1"

const srLegacyDomainSsmPath = "/sr/legacy-root-domain"
const srDomainSsmPath = "/sr/root-domain"

//client id b44d528a-3b9e-11eb-adc1-0242ac120002
const testJwtUserA = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJiNDRkNTI4YS0zYjllLTExZWItYWRjMS0wMjQyYWMxMjAwMDIiLCJpYXQiOjE2MDc3MDA3MzgsImV4cCI6MTYzOTIzNjczOCwiYXVkIjoid3d3LmV4YW1wbGUuY29tIiwic3ViIjoianJvY2tldEBleGFtcGxlLmNvbSIsIkdpdmVuTmFtZSI6IkpvaG5ueSIsIlN1cm5hbWUiOiJSb2NrZXQiLCJFbWFpbCI6Impyb2NrZXRAZXhhbXBsZS5jb20iLCJSb2xlIjpbIk1hbmFnZXIiLCJQcm9qZWN0IEFkbWluaXN0cmF0b3IiXX0.a5UE8wrudzv1TQeqYh397sm-Y-hsin-UCqmb0Ysmx9M"

//client id dec00c86-3a15-11eb-adc1-0242ac120002
const testJwtUserB = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJkZWMwMGM4Ni0zYTE1LTExZWItYWRjMS0wMjQyYWMxMjAwMDIiLCJpYXQiOjE2MDc5MzY2NzksImV4cCI6MTYzOTQ3MjY3OSwiYXVkIjoid3d3LmV4YW1wbGUuY29tIiwic3ViIjoianJvY2tldEBleGFtcGxlLmNvbSIsIkdpdmVuTmFtZSI6IkpvaG5ueSIsIlN1cm5hbWUiOiJSb2NrZXQiLCJFbWFpbCI6Impyb2NrZXRAZXhhbXBsZS5jb20iLCJSb2xlIjpbIk1hbmFnZXIiLCJQcm9qZWN0IEFkbWluaXN0cmF0b3IiXX0.gQO5WVG0hiM6RBttBr_5gaBdtYW-ZV1_VuWf9mY6c0w"

func RandomString(length int) string {
	charset := "abcdefghijklmnopqrstuvwxyz"
	b := make([]byte, length)
	for i := range b {
		b[i] = charset[seededRand.Intn(len(charset))]
	}
	return string(b)
}

// TestModule - Our test entry point
func TestModule(t *testing.T) {

	postfix := RandomString(8)

	// Terraforming
	terraformOptions := &terraform.Options{
		NoColor: true,
		Lock:    true,
		BackendConfig: map[string]interface{}{
			"key":      "modules/module-aws-cloudfront-router-edge-lambda/tests/fixures/default/" + postfix,
			"role_arn": assumeRoleArn,
		},
		TerraformDir: "fixture",
	}
	// setup TF stack
	defer destroyInfra(terraformOptions, t)

	terraform.InitAndApply(t, terraformOptions)

	outputs := terraform.OutputAll(t, terraformOptions)

	// assert outputs are wired
	assert.NotNil(t, outputs["cf_id"])
	assert.NotNil(t, outputs["cf_arn"])
	assert.NotNil(t, outputs["cf_status"])
	assert.NotNil(t, outputs["cf_domain_name"])
	assert.NotNil(t, outputs["cf_etag"])
	assert.NotNil(t, outputs["cf_hosted_zone_id"])
	assert.NotNil(t, outputs["public_domain_name"])

	publicDomainName := outputs["public_domain_name"].(string)

	defaultHeaders := map[string][]string{
		"Content-Type": {"application/json; charset=UTF-8"},
	}

	// Hit CF distro and make sure we get routed correctly using JWT in URL
	testBody("\"baseUrl\":\"https://scriptrunner.connect.adaptavist.com\"", "https://"+publicDomainName+"/sr-dispatcher/jira/atlassian-connect.json?jwt="+testJwtUserA, defaultHeaders, t)
	testBody("\"baseUrl\":\"https://sr-cloud-test.connect.adaptavist.com\"", "https://"+publicDomainName+"/sr-dispatcher/jira/atlassian-connect.json?jwt="+testJwtUserB, defaultHeaders, t)

	// Hit CF distro and make sure we get routed correctly using JWT in HTTP headers
	userAHeaders := map[string][]string{
		"Content-Type":  {"application/json; charset=UTF-8"},
		"Authorization": {"Bearer " + testJwtUserA},
	}

	testBody("\"baseUrl\":\"https://scriptrunner.connect.adaptavist.com\"", "https://"+publicDomainName+"/sr-dispatcher/jira/atlassian-connect.json", userAHeaders, t)

	userBHeaders := map[string][]string{
		"Content-Type":  {"application/json; charset=UTF-8"},
		"Authorization": {"Bearer " + testJwtUserB},
	}

	testBody("\"baseUrl\":\"https://sr-cloud-test.connect.adaptavist.com\"", "https://"+publicDomainName+"/sr-dispatcher/jira/atlassian-connect.json", userBHeaders, t)
}

func testBody(testValue string, testURL string, headers map[string][]string, t *testing.T) {

	requestURL, _ := url.Parse(testURL)

	req := &http.Request{
		Method: "GET",
		URL:    requestURL,
		Header: headers,
	}

	resp, err := http.DefaultClient.Do(req)

	assert.Nil(t, err, "There should not have been an error getting the url "+testURL)
	assert.Equal(t, resp.Status, "200 OK", "There should have been a HTTP 200 getting the url "+testURL)

	bodyBytes, err := ioutil.ReadAll(resp.Body)

	assert.Nil(t, err, "There should not of been an error reading response body")

	bodyString := string(bodyBytes)
	assert.True(t, strings.Contains(bodyString, testValue), testURL+" should contain the value "+testValue)
}

func destroyInfra(terraformOptions *terraform.Options, t *testing.T) {
	/*
		Destroy will fail because of https://forums.aws.amazon.com/thread.jspa?threadID=331402 (IaC tools cannot tidy up Edge Lambdas)
		so we have to get creative when it comes to tidying up replicated lambdas.
		We do not need to delete the lambdas, as they are associated with a CloudFront distribution, we can remove the state from Terraforms remote state.
		Then when Terraform destroys the CloudFront distro the Lambdas will get cleaned up as part of that.
	*/
	terraform.RunTerraformCommand(t, terraformOptions, "state", "rm", "module.cf_distro.module.aws-lambda.aws_lambda_function.this")

	terraform.Destroy(t, terraformOptions)
}
