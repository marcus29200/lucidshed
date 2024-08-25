import secrets
import base64

def generate_secure_key(length: int) -> str:
    """
    Generate a cryptographically secure key of a specified length.

    Args:
        length (int): The length of the key in bytes.

    Returns:
        str: A base64-encoded string of the generated key.
    """
    # Generate a secure random byte sequence of the given length
    key = secrets.token_bytes(length)
    
    # Encode the key to base64 for safe use as a string
    return base64.urlsafe_b64encode(key).decode('utf-8')

# Example usage:
key_length = 256  # Length in bytes (e.g., 32 bytes = 256 bits)
jwt_secret_key = generate_secure_key(key_length)
print(f"Generated JWT Secret Key: {jwt_secret_key}")
