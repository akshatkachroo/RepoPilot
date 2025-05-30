from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
import os
import spotipy
from spotipy.oauth2 import SpotifyOAuth


# Load environment variables




@app.route('/api/analyze-emotion', methods=['POST', 'OPTIONS'])
def analyze_emotion():
    """Analyze text and return emotion classification."""
    if request.method == 'OPTIONS':
        return jsonify({'status': 'ok'})

    try:
        data = request.get_json()
        if not data:
            print("No JSON data received")
            return jsonify({'error': 'No data provided'}), 400
            
        text = data.get('text')
        if not text:
            print("No text field in request data")
            return jsonify({'error': 'No text provided'}), 400
            
        print(f"Analyzing text: {text}")
        emotions = emotion_classifier.predict(text)
        print(f"Analysis results: {emotions}")
        
        response = jsonify({
            'emotions': [{'emotion': e, 'confidence': float(c)} for e, c in emotions]
        })
        return response
        
    except Exception as e:
        print(f"Error in analyze_emotion: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/recommend-songs', methods=['POST'])
def recommend_songs():
    """Get song recommendations based on emotion."""
    try:
        data = request.get_json()
        emotion = data.get('emotion')
        num_recommendations = data.get('num_recommendations', 10)
        
        if not emotion:
            return jsonify({'error': 'No emotion provided'}), 400
            
        recommendations = song_recommender.get_recommendations(
            emotion, 
            num_recommendations
        )
        return jsonify({'recommendations': recommendations})
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/save-to-spotify', methods=['POST'])
def save_to_spotify():
    """Save recommended songs to Spotify library."""
    try:
        data = request.get_json()
        track_uris = data.get('track_uris', [])
        access_token = data.get('access_token')
        
        if not track_uris:
            return jsonify({'error': 'No tracks provided'}), 400
        if not access_token:
            return jsonify({'error': 'No access token provided'}), 401
            
        # Initialize Spotify client with access token
        sp = spotipy.Spotify(auth=access_token)
        
        # Save tracks to library
        sp.current_user_saved_tracks_add(tracks=track_uris)
        
        return jsonify({'message': 'Tracks saved successfully'})
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/spotify-auth-url', methods=['GET'])
def get_auth_url():
    """Get Spotify authorization URL."""
    try:
        auth_url = sp_oauth.get_authorize_url()
        return jsonify({'auth_url': auth_url})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True) 
