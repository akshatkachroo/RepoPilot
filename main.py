
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
