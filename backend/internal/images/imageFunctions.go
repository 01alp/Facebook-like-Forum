package images

import (
	"bytes"
	"crypto/rand"
	"encoding/base64"
	"encoding/hex"
	"image"
	"image/png"
	"io"
	"net/http"
	"os"
	"social-network/internal/logger"
	"strconv"

	"github.com/nfnt/resize"
)

func IsValidPng(b64 string) bool {
	dec, err := base64.StdEncoding.DecodeString(b64)
	if err != nil {
		return false
	}
	r := bytes.NewReader(dec)
	_, err = png.Decode(r)
	return err == nil
}

func SaveImage(b64 string, userID int64) bool {
	dec, err := base64.StdEncoding.DecodeString(b64)
	if err != nil {
		logger.ErrorLogger.Println(err)
		return false
	}
	r := bytes.NewReader(dec)
	im, err := png.Decode(r)
	if err != nil {
		logger.ErrorLogger.Println("Bad png")
		return false
	}
	im = ResizeImg(im)
	userIDString := strconv.FormatInt(userID, 10)
	f, err := os.OpenFile("./internal/database/images/avatars/"+userIDString+".png", os.O_WRONLY|os.O_CREATE, 0777)
	if err != nil {
		logger.ErrorLogger.Println("Cannot open file")
		return false
	}

	png.Encode(f, im)
	return true
}

// Takes Image and resizes it into 250 x 250 pixel using Lanczos2           algorithm
func ResizeImg(img image.Image) image.Image {
	resizedImage := resize.Resize(150, 150, img, resize.Lanczos2)
	return resizedImage
}

func ImageHandler(r *http.Request, saveToFolder string) (string, error) {
	imageDir := "./internal/database/images/" + saveToFolder

	file, handler, err := r.FormFile("image")
	if err != nil {
		if err == http.ErrMissingFile {
			// No file provided
			return "0", nil
		}

		logger.ErrorLogger.Println("Error retrieving image:", err)
		return "", err
	}
	defer file.Close()

	// Create uploads directory if it doesn't exist
	err = os.MkdirAll(imageDir, os.ModePerm)
	if err != nil {
		logger.ErrorLogger.Println("Error creating uploads directory:", err)
		return "", err
	}

	// Generate a random string to use as the filename
	randString, err := generateRandomString(8)
	if err != nil {
		logger.ErrorLogger.Println("Error generating random string:", err)
		return "", err
	}

	// Create a new file on the server to save the uploaded image
	filename := randString + "_" + handler.Filename
	f, err := os.Create(imageDir + "/" + filename)
	if err != nil {
		logger.ErrorLogger.Println("Error creating file:", err)
		return "", err
	}
	defer f.Close()

	// Copy the uploaded file data to the new file
	_, err = io.Copy(f, file)
	if err != nil {
		logger.ErrorLogger.Println("Error copying file:", err)
		return "", err
	}

	return filename, nil
}

func generateRandomString(length int) (string, error) {
	bytes := make([]byte, length)
	_, err := rand.Read(bytes)
	if err != nil {
		return "", err
	}

	return hex.EncodeToString(bytes)[:length], nil
}
