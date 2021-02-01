package test

import (
	"testing"
	"math/rand"
	"time"
	"github.com/stretchr/testify/assert"
	"github.com/gruntwork-io/terratest/modules/terraform"
)

var seededRand = rand.New(rand.NewSource(time.Now().UnixNano()))

// Destroys infra, handling the quirks of Edge Lambdas
func destroyInfra(terraformOptions *terraform.Options, t *testing.T) {
	/*
		Destroy will fail because of https://forums.aws.amazon.com/thread.jspa?threadID=331402 (IaC tools cannot tidy up Edge Lambdas)
		so we have to get creative when it comes to tidying up replicated lambdas.
		We do not need to delete the lambdas, as they are associated with a CloudFront distribution, we can remove the state from Terraforms remote state.
		Then when Terraform destroys the CloudFront distro the Lambdas will get cleaned up as part of that.
	*/
	terraform.RunTerraformCommand(t, terraformOptions, "state", "rm", "module.cf_distro.module.edge_lambda[0].aws_lambda_function.this")
	terraform.RunTerraformCommand(t, terraformOptions, "state", "rm", "module.cf_distro.module.hsts_header_edge_lambda.aws_lambda_function.this")

	terraform.Destroy(t, terraformOptions)
}

// RandomString string generates a random string using a supplied length
func RandomString(length int) string {
	charset := "abcdefghijklmnopqrstuvwxyz"
	b := make([]byte, length)
	for i := range b {
		b[i] = charset[seededRand.Intn(len(charset))]
	}
	return string(b)
}

func assertModuleOutputs(t *testing.T, outputs map[string]interface{} ) {
		assert.NotNil(t, outputs["cf_id"])
		assert.NotNil(t, outputs["cf_arn"])
		assert.NotNil(t, outputs["cf_status"])
		assert.NotNil(t, outputs["cf_domain_name"])
		assert.NotNil(t, outputs["cf_etag"])
		assert.NotNil(t, outputs["cf_hosted_zone_id"])
		assert.NotNil(t, outputs["public_domain_name"])
}

func generateTerraformOptions(assumeRoleArn string, postfix string, fixtureName string) terraform.Options {
	terraformOptions := &terraform.Options{
		NoColor: true,
		Lock:    true,
		BackendConfig: map[string]interface{}{
			"key":      "modules/module-aws-cloudfront-edge-lambda/tests/fixures/" + fixtureName + "/" + postfix,
			"role_arn": assumeRoleArn,
		},
		TerraformDir: "fixture/",
	}

	return *terraformOptions
}
